const members = [
  { name: 'Mukesh Ravichandran', cwid: '50380788' },
  { name: 'Trisha Harjono', cwid: '50386141' },
  { name: 'Jaahnavi Garikipati', cwid: '50393610' },
  { name: 'Tejaswini Damodara Kannan', cwid: '50380778' },//All Members
];
const teamName = "The Excel-erators";

// Google Form field entry IDs
const entryIDs = {
  team: 'entry.500000070',
  member: 'entry.721958901',
  cwid: 'entry.1522950107',
  activity: 'entry.1322466239',
  duration: 'entry.737958173'
};
const formBaseURL = 'https://docs.google.com/forms/d/e/1FAIpQLSfhLBkLnU8xGQouW4lr_ALblEuij9aCkgYad5F87T06XBJUvg/viewform';

function getSelectedMember() {
  const idx = document.getElementById('member').value;
  return members[idx];
}

function updateProfile(idx) {
  document.getElementById('teamName').textContent = teamName;
  document.getElementById('cwid').textContent = members[idx].cwid;
}

function buildPrefillURL(profile, activity, duration) {
  const params = new URLSearchParams();
  params.append(entryIDs.team, teamName);
  params.append(entryIDs.member, profile.name);
  params.append(entryIDs.cwid, profile.cwid);
  params.append(entryIDs.activity, activity);
  params.append(entryIDs.duration, duration);
  return `https://docs.google.com/forms/d/e/1FAIpQLSfhLBkLnU8xGQouW4lr_ALblEuij9aCkgYad5F87T06XBJUvg/viewform?pli=1&${params.toString()}`;
}

function saveRecentLog(log) {
  let logs = JSON.parse(localStorage.getItem('fitober_logs') || '[]');
  logs.unshift(log);
  logs = logs.slice(0, 7);
  localStorage.setItem('fitober_logs', JSON.stringify(logs));
  renderRecentLogs();
}

function renderRecentLogs() {
  const logs = JSON.parse(localStorage.getItem('fitober_logs') || '[]');
  const ul = document.getElementById('recentLog');
  ul.innerHTML = '';
  logs.forEach(l => {
    const li = document.createElement('li');
    li.textContent = `${l.date} | ${l.member} | ${l.activity} (${l.duration} min)`;
    ul.appendChild(li);
  });
}

// Populate member dropdown
const memberSelect = document.getElementById('member');
members.forEach((m, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = m.name;
  memberSelect.appendChild(opt);
});
// Default to first member
memberSelect.value = 0;
updateProfile(0);
memberSelect.onchange = () => updateProfile(memberSelect.value);

document.getElementById('activityForm').onsubmit = function(e) {
  e.preventDefault();
  const idx = memberSelect.value;
  const profile = members[idx];
  const activity = document.getElementById('activity').value;
  const duration = document.getElementById('duration').value;
  if (!activity || !duration) return;

  // Log locally
  const date = new Date().toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'2-digit' });
  saveRecentLog({
    date,
    member: profile.name,
    activity,
    duration
  });

  // Open pre-filled form
  const url = buildPrefillURL(profile, activity, duration);
  window.open(url, '_blank');
};

renderRecentLogs();