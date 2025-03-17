document.addEventListener('DOMContentLoaded', () => {
  
  const authStatus = document.getElementById('auth-status');
  const githubAuthForm = document.getElementById('github-auth-form');
  const githubTokenInput = document.getElementById('github-token');
  const startDeviceFlowBtn = document.getElementById('start-device-flow');
  const checkDeviceFlowBtn = document.getElementById('check-device-flow');
  const deviceCodeStart = document.getElementById('device-code-start');
  const deviceCodePrompt = document.getElementById('device-code-prompt');
  const userCodeDisplay = document.getElementById('user-code');
  const cancelDeviceFlowBtn = document.getElementById('cancel-device-flow');
  const deviceFlowStatus = document.getElementById('device-flow-status');
  const deviceFlowMessage = document.getElementById('device-flow-message');
  const fetchModelsBtn = document.getElementById('fetch-models');
  const modelsContainer = document.getElementById('models-container');
  const modelSelect = document.getElementById('model-select');
  const chatForm = document.getElementById('chat-form');
  const systemMessage = document.getElementById('system-message');
  const userMessage = document.getElementById('user-message');
  const temperatureInput = document.getElementById('temperature');
  const topPInput = document.getElementById('top-p');
  const maxTokensInput = document.getElementById('max-tokens');
  const responseContainer = document.getElementById('response-container');
  const responseLoading = document.getElementById('response-loading');
  const responseContent = document.getElementById('response-content');
  
  
  let deviceCode = null;
  let deviceCodeExpiry = null;
  let selectedModel = null;
  
  
  checkAuthStatus();
  
  
  githubAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = githubTokenInput.value.trim();
    
    if (!token) {
      alert('Please enter a GitHub token');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateAuthStatus(true);
        alert('Authentication successful!');
        githubTokenInput.value = '';
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  
  
  startDeviceFlowBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/device');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start device flow');
      }
      
      
      deviceCode = data.data.device_code;
      userCodeDisplay.textContent = data.data.user_code;
      
      
      const expiresIn = data.data.expires_in || 900; 
      deviceCodeExpiry = Date.now() + (expiresIn * 1000);
      
      
      deviceCodeStart.classList.add('d-none');
      deviceCodePrompt.classList.remove('d-none');
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  
  
  checkDeviceFlowBtn.addEventListener('click', async () => {
    if (!deviceCode) {
      alert('No device code available. Please start the device flow again.');
      resetDeviceFlow();
      return;
    }
    
    
    if (deviceCodeExpiry && Date.now() > deviceCodeExpiry) {
      alert('Device code has expired. Please start the device flow again.');
      resetDeviceFlow();
      return;
    }
    
    try {
      
      deviceFlowStatus.classList.remove('d-none');
      deviceFlowStatus.classList.remove('alert-danger', 'alert-success');
      deviceFlowStatus.classList.add('alert-secondary');
      deviceFlowMessage.textContent = 'Checking authentication status...';
      checkDeviceFlowBtn.disabled = true;
      
      
      const response = await fetch('/api/auth/device/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ device_code: deviceCode })
      });
      
      const data = await response.json();
      
      if (data.success && data.status === 'complete') {
        
        deviceFlowStatus.classList.remove('alert-secondary', 'alert-danger');
        deviceFlowStatus.classList.add('alert-success');
        deviceFlowMessage.textContent = 'Authentication successful!';
        
        setTimeout(() => {
          resetDeviceFlow();
          updateAuthStatus(true);
        }, 2000);
      } else if (data.error === 'authorization_pending') {
        
        deviceFlowStatus.classList.remove('alert-secondary', 'alert-danger');
        deviceFlowStatus.classList.add('alert-warning');
        deviceFlowMessage.textContent = 'Waiting for authorization. Please complete the process on GitHub.';
        checkDeviceFlowBtn.disabled = false;
      } else if (data.error === 'slow_down') {
        
        deviceFlowStatus.classList.remove('alert-secondary');
        deviceFlowStatus.classList.add('alert-warning');
        deviceFlowMessage.textContent = 'Too many requests. Please wait a moment before trying again.';
        checkDeviceFlowBtn.disabled = false;
      } else {
        
        deviceFlowStatus.classList.remove('alert-secondary');
        deviceFlowStatus.classList.add('alert-danger');
        deviceFlowMessage.textContent = data.error_description || 'An error occurred during authentication.';
        checkDeviceFlowBtn.disabled = false;
      }
    } catch (error) {
      deviceFlowStatus.classList.remove('alert-secondary');
      deviceFlowStatus.classList.add('alert-danger');
      deviceFlowMessage.textContent = `Error: ${error.message}`;
      checkDeviceFlowBtn.disabled = false;
    }
  });
  
  
  cancelDeviceFlowBtn.addEventListener('click', () => {
    resetDeviceFlow();
  });
  
  
  fetchModelsBtn.addEventListener('click', async () => {
    try {
      modelsContainer.innerHTML = '<div class="text-center my-5"><div class="spinner-border"></div><p class="mt-3">Loading models...</p></div>';
      
      const response = await fetch('/api/models');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch models');
      }
      
      
      console.log('Models data:', data.data);
      
      displayModels(data.data);
      populateModelSelect(data.data);
    } catch (error) {
      console.error('Error fetching models:', error);
      modelsContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  });
  
  
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const model = modelSelect.value;
    const system = systemMessage.value.trim();
    const user = userMessage.value.trim();
    const temperature = parseFloat(temperatureInput.value);
    const top_p = parseFloat(topPInput.value);
    const max_tokens = parseInt(maxTokensInput.value);
    
    if (!model) {
      alert('Please select a model');
      return;
    }
    
    if (!user) {
      alert('Please enter a message');
      return;
    }
    
    
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ];
    
    try {
      
      responseContainer.classList.remove('d-none');
      responseLoading.classList.remove('d-none');
      responseContent.classList.add('d-none');
      responseContent.innerHTML = '';
      
      
      const requestData = {
        messages,
        model,
        temperature,
        top_p,
        max_tokens
      };
      
      
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      
      const reader = response.body.getReader();
      let fullText = '';
      
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                fullText += content;
                
                
                responseContent.innerHTML = marked.parse(fullText);
                
                
                responseLoading.classList.add('d-none');
                responseContent.classList.remove('d-none');
                
                
                responseContent.scrollTop = responseContent.scrollHeight;
              }
            } catch (err) {
              console.error('Error parsing chunk:', err);
            }
          }
        }
      }
      
      
      responseContent.innerHTML = marked.parse(fullText);
      responseLoading.classList.add('d-none');
      responseContent.classList.remove('d-none');
      
    } catch (error) {
      responseLoading.classList.add('d-none');
      responseContent.classList.remove('d-none');
      responseContent.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  });
  
  
  
  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (data.success && data.hasToken && data.isValid) {
        updateAuthStatus(true);
      } else {
        updateAuthStatus(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      updateAuthStatus(false);
    }
  }
  
  function updateAuthStatus(isAuthenticated) {
    if (isAuthenticated) {
      authStatus.textContent = 'Authenticated';
      authStatus.classList.remove('bg-secondary', 'bg-danger');
      authStatus.classList.add('bg-success');
      
      fetchModelsBtn.disabled = false;
    } else {
      authStatus.textContent = 'Not Authenticated';
      authStatus.classList.remove('bg-success', 'bg-danger');
      authStatus.classList.add('bg-secondary');
      
      fetchModelsBtn.disabled = true;
      modelSelect.disabled = true;
      chatForm.querySelector('button[type="submit"]').disabled = true;
    }
  }
  
  function resetDeviceFlow() {
    deviceCodeStart.classList.remove('d-none');
    deviceCodePrompt.classList.add('d-none');
    deviceFlowStatus.classList.add('d-none');
    checkDeviceFlowBtn.disabled = false;
    deviceCode = null;
    deviceCodeExpiry = null;
  }
  
  function displayModels(models) {
    
    if (!models) {
      modelsContainer.innerHTML = '<div class="alert alert-warning">No models data received</div>';
      return;
    }
    
    
    const modelsArray = Array.isArray(models) ? models : 
                        (typeof models === 'object' ? [models] : []);
    
    if (modelsArray.length === 0) {
      modelsContainer.innerHTML = '<div class="alert alert-warning">No models available</div>';
      return;
    }
    
    
    const table = document.createElement('table');
    table.className = 'table table-striped table-models';
    
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Model ID</th>
        <th>Family</th>
        <th>Max Tokens</th>
        <th>Features</th>
      </tr>
    `;
    table.appendChild(thead);
    
    
    const tbody = document.createElement('tbody');
    
    modelsArray.forEach(model => {
      
      if (typeof model !== 'object' || model === null) return;
      
      const tr = document.createElement('tr');
      
      
      const capabilities = [];
      
      
      if (model.capabilities && typeof model.capabilities === 'object') {
        
        const family = model.capabilities.family || model.family || 'Unknown';
        
        
        let maxTokens = 'Unknown';
        if (model.capabilities.limits && model.capabilities.limits.max_output_tokens) {
          maxTokens = model.capabilities.limits.max_output_tokens;
        }
        
        
        if (model.capabilities.type === 'chat') capabilities.push('Chat');
        if (model.capabilities.type === 'embeddings') capabilities.push('Embeddings');
        
        const supports = model.capabilities.supports || {};
        if (supports.vision) capabilities.push('Vision');
        if (supports.tool_calls) capabilities.push('Tool Calls');
        if (supports.streaming) capabilities.push('Streaming');
        if (supports.parallel_tool_calls) capabilities.push('Parallel Tools');
        if (supports.structured_outputs) capabilities.push('Structured Outputs');
        
        tr.innerHTML = `
          <td>${model.id || 'Unknown'}</td>
          <td>${family}</td>
          <td>${maxTokens}</td>
          <td>${capabilities.join(', ') || 'None'}</td>
        `;
      } else {
        
        if (Array.isArray(model.capabilities)) {
          if (model.capabilities.includes('code_completion')) capabilities.push('Code');
          if (model.capabilities.includes('embeddings')) capabilities.push('Embeddings');
          if (model.capabilities.includes('chat')) capabilities.push('Chat');
        }
        
        tr.innerHTML = `
          <td>${model.id || 'Unknown'}</td>
          <td>${model.family || 'Unknown'}</td>
          <td>${model.limits?.max_tokens || 'Unknown'}</td>
          <td>${capabilities.join(', ') || 'None'}</td>
        `;
      }
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    
    if (tbody.children.length === 0) {
      modelsContainer.innerHTML = '<div class="alert alert-warning">No valid models found in the response</div>';
      
      const pre = document.createElement('pre');
      pre.className = 'mt-3 p-3 bg-light';
      pre.textContent = JSON.stringify(models, null, 2);
      modelsContainer.appendChild(pre);
      return;
    }
    
    modelsContainer.innerHTML = '';
    modelsContainer.appendChild(table);
  }
  
  function populateModelSelect(models) {
    
    while (modelSelect.options.length > 1) {
      modelSelect.remove(1);
    }
    
    const modelsArray = Array.isArray(models) ? models : 
                        (typeof models === 'object' ? [models] : []);
    
    modelsArray.forEach(model => {
      if (model && model.id) {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = `${model.id}`;
        modelSelect.appendChild(option);
      }
    });
    
    modelSelect.disabled = false;
    chatForm.querySelector('button[type="submit"]').disabled = false;
  }
}); 