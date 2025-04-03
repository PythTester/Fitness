// ====== Helpers ======
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  
  function getUsers() {
    return JSON.parse(localStorage.getItem('fitness_users')) || [];
  }
  
  function saveUsers(users) {
    localStorage.setItem('fitness_users', JSON.stringify(users));
  }
  
  // ====== Elements ======
  const signupUsername = document.getElementById('signup-username');
  const signupPassword = document.getElementById('signup-password');
  const signupAvatar = document.getElementById('signup-avatar');
  const signupBtn = document.getElementById('signup-btn');
  const signupError = document.getElementById('signup-error');
  const showLogin = document.getElementById('show-login');
  
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const showSignup = document.getElementById('show-signup');
  
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const dashboard = document.getElementById('dashboard');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');
  const logoutBtn = document.getElementById('logout-btn');
  
  const profilesList = document.getElementById('profiles-list');
  const profileName = document.getElementById('profile-name');
  const profileAvatar = document.getElementById('profile-avatar');
  const addProfileBtn = document.getElementById('add-profile-btn');
  const profileError = document.getElementById('profile-error');
  
  const profileSelector = document.getElementById('profile-selector');
  const viewProfileSelector = document.getElementById('view-profile-selector');
  const goalTitle = document.getElementById('goal-title');
  const goalType = document.getElementById('goal-type');
  const goalAmount = document.getElementById('goal-amount');
  const goalMonth = document.getElementById('goal-month');
  const addGoalBtn = document.getElementById('add-goal-btn');
  const goalError = document.getElementById('goal-error');
  const goalsList = document.getElementById('goals-list');
  
  const changeAvatarInput = document.getElementById('change-avatar');
  const toggleDarkBtn = document.getElementById('toggle-dark');
  
  const statProfiles = document.getElementById('stat-profiles');
  const statGoals = document.getElementById('stat-goals');
  const statCompletion = document.getElementById('stat-completion');
  const statStreak = document.getElementById('stat-streak');
  const summaryProfileSelector = document.getElementById('summary-profile-selector');
  const goalCategory = document.getElementById('goal-category');

  const SESSION_KEY = 'fitness_session';
  
  // ====== Event Listeners ======
  signupBtn.addEventListener('click', handleSignup);
  loginBtn.addEventListener('click', handleLogin);
  showLogin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  showSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
  addProfileBtn.addEventListener('click', handleAddProfile);
  addGoalBtn.addEventListener('click', handleAddGoal);
  userAvatar.addEventListener('click', () => changeAvatarInput.click());
  changeAvatarInput.addEventListener('change', handleChangeAvatar);
  viewProfileSelector.addEventListener('change', () => {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    renderGoals(session);
  });
  toggleDarkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
  summaryProfileSelector.addEventListener('change', () => {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    updateSummaryStats(session);
  });
  
  
  // ====== Auth Functions ======
  function handleSignup() {
    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();
    if (!username || !password) {
      signupError.textContent = 'Please fill all fields.';
      return;
    }
  
    let users = getUsers();
    if (users.some(u => u.username === username)) {
      signupError.textContent = 'Username already taken!';
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatar = e.target.result || '';
      const defaultProfile = {
        profileId: Date.now(),
        name: username,
        avatar,
        goals: []
      };
      const newUser = {
        username,
        password: hashPassword(password),
        avatar,
        profiles: [defaultProfile]
      };
      users.push(newUser);
      saveUsers(users);
      alert('Account created! Please log in.');
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    };
  
    if (signupAvatar.files[0]) {
      reader.readAsDataURL(signupAvatar.files[0]);
    } else {
      reader.onload({ target: { result: '' } });
    }
  }
  
  function handleLogin() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
  
    let users = getUsers();
    const user = users.find(u => u.username === username);
  
    if (!user || user.password !== hashPassword(password)) {
      loginError.textContent = 'Invalid credentials.';
      return;
    }
  
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    showDashboard(user);
  }
  
  function showDashboard(user) {
    document.getElementById('auth-section').style.display = 'none';
    dashboard.style.display = 'block';
    userName.textContent = user.username;
    userAvatar.src = user.avatar || 'assets/default-profile.png';
    renderProfiles(user);
    renderGoals(user);
  }
  
  function handleChangeAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const newAvatar = e.target.result;
      let users = getUsers();
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      let user = users.find(u => u.username === session.username);
  
      user.avatar = newAvatar;
      saveUsers(users);
      session.avatar = newAvatar;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      userAvatar.src = newAvatar;
    };
    reader.readAsDataURL(file);
  }
  
  // ====== Profile Functions ======
  function handleAddProfile() {
    const name = profileName.value.trim();
    const reader = new FileReader();
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    let users = getUsers();
    let user = users.find(u => u.username === session.username);
  
    if (!name) {
      profileError.textContent = 'Please enter profile name';
      return;
    }
  
    reader.onload = function (e) {
      const avatar = e.target.result || '';
      const newProfile = {
        profileId: Date.now(),
        name,
        avatar,
        goals: []
      };
      user.profiles.push(newProfile);
      saveUsers(users);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      renderProfiles(user);
      renderGoals(user);
      profileName.value = '';
      profileError.textContent = '';
    };
  
    if (profileAvatar.files[0]) {
      reader.readAsDataURL(profileAvatar.files[0]);
    } else {
      reader.onload({ target: { result: '' } });
    }
  }
  
  function renderProfiles(user) {
    profilesList.innerHTML = '';
    profileSelector.innerHTML = '';
    viewProfileSelector.innerHTML = '';
  
    user.profiles.forEach(profile => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${profile.name}</strong><br/>
        <img src="${profile.avatar}" width="50" height="50" style="border-radius:50%; cursor:pointer;" id="profile-avatar-${profile.profileId}" />
        <input type="file" id="profile-avatar-input-${profile.profileId}" style="display:none;" />
      `;
      profilesList.appendChild(div);
  
      const option = document.createElement('option');
      option.value = profile.profileId;
      option.textContent = profile.name;
      profileSelector.appendChild(option);
  
      const viewOption = document.createElement('option');
      viewOption.value = profile.profileId;
      viewOption.textContent = profile.name;
      viewProfileSelector.appendChild(viewOption);
  
      const avatarImg = document.getElementById(`profile-avatar-${profile.profileId}`);
      const avatarInput = document.getElementById(`profile-avatar-input-${profile.profileId}`);
  
      avatarImg.addEventListener('click', () => avatarInput.click());
      avatarInput.addEventListener('change', (event) => handleChangeProfileAvatar(event, profile.profileId));
    });
  
    if (user.profiles.length > 0) {
      viewProfileSelector.value = user.profiles[0].profileId;

      summaryProfileSelector.innerHTML = '<option value="all">All Profiles</option>';
user.profiles.forEach(profile => {
  const option = document.createElement('option');
  option.value = profile.profileId;
  option.textContent = profile.name;
  summaryProfileSelector.appendChild(option);
});
summaryProfileSelector.value = 'all';
    }
  }
  
  function handleChangeProfileAvatar(event, profileId) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const newAvatar = e.target.result;
      let users = getUsers();
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      let user = users.find(u => u.username === session.username);
  
      const profile = user.profiles.find(p => p.profileId === profileId);
      profile.avatar = newAvatar;
      saveUsers(users);
  
      session.profiles = user.profiles;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      renderProfiles(user);
    };
    reader.readAsDataURL(file);

  }
  
  // ====== Goal Functions ======
  function handleAddGoal() {
    const category = goalCategory.value;
    const type = goalType.value;
    const amount = parseInt(goalAmount.value);
    const month = goalMonth.value;
    const profileId = parseInt(profileSelector.value);
    let users = getUsers();
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    let user = users.find(u => u.username === session.username);
  
    if (!category || !amount || !month || !profileId) {
      goalError.textContent = 'Please fill all fields';
      return;
    }
  
    const profile = user.profiles.find(p => p.profileId === profileId);
    const title = `${amount} ${type === 'time' ? 'minutes' : 'reps'} of ${category}`;
  
    profile.goals.push({
      id: Date.now(),
      title,
      type,
      amount,
      month,
      progress: 0,
      createdAt: new Date().toISOString()
    });
  
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    renderGoals(user);
  
    goalCategory.value = '';
    goalAmount.value = '';
    goalMonth.value = '';
    goalError.textContent = '';
  }
  
  
  function renderGoals(user) {
    goalsList.innerHTML = '';
    const selectedProfileId = parseInt(viewProfileSelector.value);
    const profile = user.profiles.find(p => p.profileId === selectedProfileId);
  
    if (!profile) {
      goalsList.innerHTML = '<p>Select a profile to view goals.</p>';
      return;
    }
  
    if (profile.goals.length === 0) {
      goalsList.innerHTML = '<p>No goals for this profile yet.</p>';
      return;
    }
  
    const header = document.createElement('h4');
    header.textContent = `${profile.name}'s Goals`;
    goalsList.appendChild(header);
  
    profile.goals.forEach(goal => {
      if (!goal.createdAt) {
        goal.createdAt = new Date().toISOString();
      }
      const createdDate = new Date(goal.createdAt);
      const daysOnGoal = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const progressPercent = Math.min((goal.progress / goal.amount) * 100, 100);
  
      const goalCard = document.createElement('div');
      goalCard.className = 'goal-card';
      goalCard.innerHTML = `
        <div class="goal-title">🏆 ${goal.title}</div>
        <div class="goal-meta">
          <span>📅 ${goal.month}</span>
          <span class="goal-tag ${goal.type === 'reps' ? 'reps' : ''}">${goal.type === 'time' ? '⏱️ Time' : '🔢 Reps'}</span>
        </div>
        <div class="goal-meta">
          <span>Target: ${goal.amount} ${goal.type === 'time' ? 'mins' : 'reps'}</span>
          <span>Progress: ${goal.progress} / ${goal.amount}</span>
        </div>
        <div class="goal-meta">
          <span>Started: ${createdDate.toLocaleDateString()}</span>
          <span>${daysOnGoal} days active</span>
        </div>
        <div class="progress-bar"><div class="progress" style="width:${progressPercent}%"></div></div>
        <div class="goal-actions">
          <input type="number" placeholder="Add ${goal.type}" id="progress-${goal.id}" />
          <button class="add-btn" onclick="addProgress(${goal.id}, ${profile.profileId})">Add</button>
          <button class="delete-btn" onclick="deleteGoal(${goal.id}, ${profile.profileId})">Delete</button>
        </div>
      `;
      goalsList.appendChild(goalCard);
    });
  
    updateSummaryStats(user);
  }
  
  function updateSummaryStats(user) {
    let selectedProfileId = summaryProfileSelector.value;
    let profilesToCount = selectedProfileId === 'all'
      ? user.profiles
      : user.profiles.filter(p => p.profileId === parseInt(selectedProfileId));
  
    let totalProfiles = profilesToCount.length;
    let totalGoals = 0;
    let totalProgress = 0;
    let totalTargets = 0;
    let longestStreak = 0;
  
    profilesToCount.forEach(profile => {
      totalGoals += profile.goals.length;
      profile.goals.forEach(goal => {
        totalProgress += goal.progress;
        totalTargets += goal.amount;
        if (goal.createdAt) {
          const createdDate = new Date(goal.createdAt);
          const daysOnGoal = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysOnGoal > longestStreak) longestStreak = daysOnGoal;
        }
      });
    });
  
    const completionPercent = totalTargets > 0 ? Math.floor((totalProgress / totalTargets) * 100) : 0;
  
    statProfiles.textContent = totalProfiles;
    statGoals.textContent = totalGoals;
    statCompletion.textContent = `${completionPercent}%`;
    statStreak.textContent = `${longestStreak} days`;
  }
  
  
  function addProgress(goalId, profileId) {
    let users = getUsers();
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    let user = users.find(u => u.username === session.username);
    const profile = user.profiles.find(p => p.profileId === profileId);
    const goal = profile.goals.find(g => g.id === goalId);
    const input = document.getElementById(`progress-${goalId}`);
    const added = parseInt(input.value);
  
    if (!added || added <= 0) return;
  
    goal.progress += added;
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    renderGoals(user);
  }
  
  function deleteGoal(goalId, profileId) {
    let users = getUsers();
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    let user = users.find(u => u.username === session.username);
    const profile = user.profiles.find(p => p.profileId === profileId);
  
    profile.goals = profile.goals.filter(g => g.id !== goalId);
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    renderGoals(user);
  }
  
  // ====== On Load ======
  window.onload = function () {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (session) {
      showDashboard(session);
    }
    const darkPref = localStorage.getItem('darkMode') === 'true';
    if (darkPref) {
      document.body.classList.add('dark-mode');
    }
  };
