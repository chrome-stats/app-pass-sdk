<script lang="ts">
  import { onMount } from 'svelte';
  import { checkAppPass, activateAppPass, manageAppPass } from '@chrome-stats/app-pass-sdk';

  // State: 'loading', 'active', or 'inactive'
  let status: 'loading' | 'active' | 'inactive' = 'loading';
  let email = '';
  let isActivating = false;

  async function checkStatus() {
    status = 'loading';
    const response = await checkAppPass();
    // Only 'ok' means active, everything else (error, no_apppass) is inactive
    if (response.status === 'ok') {
      email = response.email || 'Premium User';
      status = 'active';
    } else {
      status = 'inactive';
    }
  }

  async function handleActivate() {
    isActivating = true;
    try {
      await activateAppPass();
    } catch (err) {
      console.error('Failed to activate App Pass:', err);
    } finally {
      isActivating = false;
    }
  }

  async function handleManage() {
    try {
      await manageAppPass();
    } catch (err) {
      console.error('Failed to open management page:', err);
    }
  }

  onMount(checkStatus);
</script>

<div class="container">
  <h2>App Pass Example</h2>

  {#if status === 'loading'}
    <p>Loading status...</p>
  {:else if status === 'active'}
    <div class="card active-card">
      <h3>⭐ App Pass is Active</h3>
      <p>Welcome back, <strong>{email}</strong>!</p>
      <button on:click={handleManage}>Manage Subscription</button>
    </div>
  {:else}
    <div class="card inactive-card">
      <h3>App Pass is not active</h3>
      <p>Unlock premium features by activating App Pass.</p>
      <button on:click={handleActivate} disabled={isActivating}>
        {isActivating ? 'Opening...' : 'Activate App Pass'}
      </button>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    width: 300px;
    font-family: system-ui, sans-serif;
    margin: 0;
    padding: 16px;
    background: #f8f9fa;
    color: #333;
  }
  
  h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }
  
  .card {
    padding: 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .active-card {
    border-left: 4px solid #10b981;
  }
  
  .inactive-card {
    border-left: 4px solid #f59e0b;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
  }
  
  p {
    margin: 0 0 16px 0;
    font-size: 0.9rem;
  }
  
  button {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  button:hover {
    background: #4338ca;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
