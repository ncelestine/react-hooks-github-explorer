import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// This component shows one GitHub user in the search results.
// React.memo helps stop unnecessary re-renders if props don't change.
const UserCard = React.memo(function UserCard({ user, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(user)}
      style={{
        border: isSelected ? "2px solid #2563eb" : "1px solid #ccc",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "10px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#eff6ff" : "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <img
          src={user.avatar_url}
          alt={user.login}
          width="55"
          height="55"
          style={{ borderRadius: "50%" }}
        />

        <div>
          <div style={{ fontWeight: "bold" }}>
            {user.name || user.login}
          </div>
          <div>@{user.login}</div>
          <div>{user.bio || "No bio available"}</div>
          <div>Followers: {user.followers ?? "Unknown"}</div>
        </div>
      </div>
    </div>
  );
});

// This component is just the language dropdown filter.
// React.memo helps because this doesn't need to re-render unless props change.
const FilterBar = React.memo(function FilterBar({
  languages,
  selectedLanguage,
  onChange,
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ marginRight: "8px", fontWeight: "bold" }}>
        Filter by language:
      </label>

      <select value={selectedLanguage} onChange={onChange}>
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
});

export default function GitHubApp() {
  // Search box text
  const [query, setQuery] = useState("");

  // This stores the debounced version of the search
  // so we don't fetch on every single key press
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Search results from GitHub user search
  const [users, setUsers] = useState([]);

  // Stores the selected user from the search results
  const [selectedUser, setSelectedUser] = useState(null);

  // Full profile data for the selected user
  // We need this because search results do not include bio/followers/name fully
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Repositories of the selected user
  const [repos, setRepos] = useState([]);

  // Language filter state
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // ---------------------------
  // 1) Debounce the search input
  // ---------------------------
  // Wait 500ms after the user stops typing before searching (debounce).
  // That means we wait 500ms after the user stops typing before fetching.
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);

    // Cleanup: clear the timer if the user keeps typing
    return () => clearTimeout(timerId);
  }, [query]);

  // ---------------------------
  // 2) Fetch users when debouncedQuery changes
  // ---------------------------
  useEffect(() => {
    // If search box is empty, reset everything
    if (!debouncedQuery) {
      setUsers([]);
      setSelectedUser(null);
      setSelectedUserDetails(null);
      setRepos([]);
      setSelectedLanguage("All");
      setError("");
      return;
    }

    const controller = new AbortController();

    async function fetchUsers() {
      try {
        setLoadingUsers(true);
        setError("");

        const response = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(
            debouncedQuery
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub users.");
        }

        const data = await response.json();
        setUsers(data.items || []);
      } catch (err) {
        // Ignore abort errors because those are expected during cleanup
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong while fetching users.");
        }
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();

    // Cleanup: abort old request if query changes or component unmounts
    return () => controller.abort();
  }, [debouncedQuery]);

  // ---------------------------
  // 3) Fetch selected user's full profile
  // ---------------------------
  // This is needed for name, bio, and follower count.
  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserDetails(null);
      return;
    }

    const controller = new AbortController();

    async function fetchUserDetails() {
      try {
        setLoadingUserDetails(true);
        setError("");

        const response = await fetch(
          `https://api.github.com/users/${selectedUser.login}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch selected user details.");
        }

        const data = await response.json();
        setSelectedUserDetails(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong while fetching user details."
          );
        }
      } finally {
        setLoadingUserDetails(false);
      }
    }

    fetchUserDetails();

    return () => controller.abort();
  }, [selectedUser]);

  // ---------------------------
  // 4) Fetch repos when a user is selected
  // ---------------------------
  useEffect(() => {
    if (!selectedUser) {
      setRepos([]);
      setSelectedLanguage("All");
      return;
    }

    const controller = new AbortController();

    async function fetchRepos() {
      try {
        setLoadingRepos(true);
        setError("");

        const response = await fetch(
          `https://api.github.com/users/${selectedUser.login}/repos`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch repositories.");
        }

        const data = await response.json();
        setRepos(data || []);
        setSelectedLanguage("All");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong while fetching repositories."
          );
        }
      } finally {
        setLoadingRepos(false);
      }
    }

    fetchRepos();

    return () => controller.abort();
  }, [selectedUser]);

  // ---------------------------
  // 5) Memoize sorted repos by star count
  // ---------------------------
  // useMemo prevents sorting on every render unless repos actually change.
  const sortedRepos = useMemo(() => {
    return [...repos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );
  }, [repos]);

  // ---------------------------
  // 6) Memoize unique languages for dropdown
  // ---------------------------
  const languages = useMemo(() => {
    const uniqueLanguages = repos
      .map((repo) => repo.language)
      .filter(Boolean);

    return ["All", ...new Set(uniqueLanguages)];
  }, [repos]);

  // ---------------------------
  // 7) Memoize filtered repos based on selected language
  // ---------------------------
  const filteredRepos = useMemo(() => {
    if (selectedLanguage === "All") {
      return sortedRepos;
    }

    return sortedRepos.filter((repo) => repo.language === selectedLanguage);
  }, [sortedRepos, selectedLanguage]);

  // ---------------------------
  // 8) Memoize repo stats
  // ---------------------------
  // Stats shown: total repos, average stars, most-forked repo
  const stats = useMemo(() => {
    if (repos.length === 0) {
      return {
        total: 0,
        avgStars: 0,
        mostForked: "None",
      };
    }

    const total = repos.length;

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    const avgStars = (totalStars / total).toFixed(1);

    const mostForkedRepo = repos.reduce((maxRepo, currentRepo) => {
      return currentRepo.forks_count > maxRepo.forks_count
        ? currentRepo
        : maxRepo;
    }, repos[0]);

    return {
      total,
      avgStars,
      mostForked: mostForkedRepo.name,
    };
  }, [repos]);

  // ---------------------------
  // 9) Memoize handlers with useCallback
  // ---------------------------
  // This is useful because these handlers are passed to memoized child components.

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  const handleFilterChange = useCallback((event) => {
    setSelectedLanguage(event.target.value);
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>GitHub User Explorer</h1>

      <p>
        Search for GitHub users, select one, and explore their repositories.
      </p>

      <input
        type="text"
        placeholder="Search GitHub users..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{
          padding: "10px",
          width: "320px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {loadingUsers && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT SIDE = users list */}
        <div>
          <h2>Users</h2>

          {!loadingUsers && debouncedQuery && users.length === 0 && (
            <p>No users found.</p>
          )}

          {users.map((user) => (
            <UserCard
              key={user.id}
              user={
                selectedUserDetails &&
                selectedUser &&
                selectedUser.login === user.login
                  ? selectedUserDetails
                  : user
              }
              onSelect={handleSelectUser}
              isSelected={selectedUser?.login === user.login}
            />
          ))}
        </div>

        {/* RIGHT SIDE = selected user info + repos */}
        <div>
          <h2>Repositories</h2>

          {!selectedUser && <p>Select a user to view their repositories.</p>}

          {selectedUser && (
            <>
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Selected User</h3>

                {loadingUserDetails ? (
                  <p>Loading user details...</p>
                ) : selectedUserDetails ? (
                  <>
                    <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                      {selectedUserDetails.name || selectedUserDetails.login}
                    </div>
                    <div>@{selectedUserDetails.login}</div>
                    <div style={{ marginTop: "8px" }}>
                      {selectedUserDetails.bio || "No bio available"}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      Followers: {selectedUserDetails.followers}
                    </div>
                  </>
                ) : (
                  <p>Loading selected user...</p>
                )}
              </div>

              {/* Summary bar from memoized stats */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "12px",
                    minWidth: "140px",
                  }}
                >
                  <strong>Total repos</strong>
                  <div>{stats.total}</div>
                </div>

                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "12px",
                    minWidth: "140px",
                  }}
                >
                  <strong>Avg stars</strong>
                  <div>{stats.avgStars}</div>
                </div>

                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "12px",
                    minWidth: "180px",
                  }}
                >
                  <strong>Most forked</strong>
                  <div>{stats.mostForked}</div>
                </div>
              </div>

              {/* Language filter */}
              <FilterBar
                languages={languages}
                selectedLanguage={selectedLanguage}
                onChange={handleFilterChange}
              />

              {loadingRepos && <p>Loading repositories...</p>}

              {!loadingRepos && filteredRepos.length === 0 && (
                <p>No repositories match this filter.</p>
              )}

              <div>
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "12px",
                    }}
                  >
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontWeight: "bold",
                        fontSize: "17px",
                        textDecoration: "none",
                      }}
                    >
                      {repo.name}
                    </a>

                    <div style={{ marginTop: "6px" }}>
                      {repo.description || "No description"}
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      ⭐ Stars: {repo.stargazers_count}
                    </div>

                    <div>🍴 Forks: {repo.forks_count}</div>

                    <div>🧠 Language: {repo.language || "Unknown"}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}