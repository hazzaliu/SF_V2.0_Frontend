// Quick fix to set the correct session ID in localStorage
// Run this in the browser console

const projectId = "7324ed2d-f81e-4409-ab6c-019531ec5af1";
const correctSessionId = "e9e624bc-6af3-4817-9768-52fcb7cc1245";

// Set the project-specific session ID
localStorage.setItem(`project-session-${projectId}`, correctSessionId);

// Also set the general user session ID
localStorage.setItem('user-session-id', correctSessionId);

console.log("✅ Session IDs set:");
console.log(`   project-session-${projectId}: ${localStorage.getItem(`project-session-${projectId}`)}`);
console.log(`   user-session-id: ${localStorage.getItem('user-session-id')}`);
console.log("🔄 Please refresh the page to test the fix");