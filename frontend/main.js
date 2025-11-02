const BACKEND_URL = 'http://localhost:8080';



const dynamicData = {
    skills: [],
    academic: [],
    workExperience: [], 
    projects: []
};


const displayMessage = (id, message, type = 'error') => {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        // Use class names defined in style.css (error, success, info)
        el.className = `message-box ${type}`;
        el.style.display = 'block';
    }
};

// Renders the current list of skills as clickable tags
const renderSkills = () => {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    // Creates a styled span for each skill with a remove button
    container.innerHTML = dynamicData.skills.map((skill, index) => 
        `<span style="background: #e9ecef; padding: 5px 10px; border-radius: 5px; margin: 5px; display: inline-block;">
            ${skill} 
            <button type="button" class="remove-btn" onclick="removeDynamicItem('skills', ${index})">x</button>
        </span>`
    ).join('');
};

// Renders dynamic rows for Academic entries
const renderAcademic = () => {
    const container = document.getElementById('academicContainer');
    if (!container) return;
    
    container.innerHTML = dynamicData.academic.map((item, index) => 
        `<div class="input-row" data-id="${index}">
            <input type="text" placeholder="Institute" value="${item.institute || ''}" onchange="updateAcademicItem(${index}, 'institute', this.value)">
            <input type="text" placeholder="Degree" value="${item.degree || ''}" onchange="updateAcademicItem(${index}, 'degree', this.value)">
            <input type="text" placeholder="Year" value="${item.year || ''}" onchange="updateAcademicItem(${index}, 'year', this.value)">
            <button type="button" class="remove-btn" onclick="removeDynamicItem('academic', ${index})">x</button>
        </div>`
    ).join('');
};

// Renders dynamic rows for Projects entries
const renderProjects = () => {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    container.innerHTML = dynamicData.projects.map((project, index) => 
        `<div class="input-group">
            <input type="text" value="${project}" onchange="updateDynamicItem('projects', ${index}, this.value)" />
            <button type="button" class="remove-btn" onclick="removeDynamicItem('projects', ${index})">x</button>
        </div>`
    ).join('');
};

// Adds a new item to the dynamicData array and rerenders
const addDynamicItem = (type) => {
    if (type === 'skill') {
        const input = document.getElementById('newSkillInput');
        if (input && input.value.trim()) {
            dynamicData.skills.push(input.value.trim());
            input.value = '';
            renderSkills();
        }
    } else if (type === 'project') {
        const input = document.getElementById('newProjectInput');
        if (input && input.value.trim()) {
            dynamicData.projects.push(input.value.trim());
            input.value = '';
            renderProjects();
        }
    } else if (type === 'academic') {
        dynamicData.academic.push({ institute: '', degree: '', year: '' });
        renderAcademic();
    }
};

// Removes an item from the dynamicData array and rerenders
const removeDynamicItem = (arrayName, index) => {
    dynamicData[arrayName].splice(index, 1);
    if (arrayName === 'skills') renderSkills();
    if (arrayName === 'projects') renderProjects();
    if (arrayName === 'academic') renderAcademic();
};

// Updates structured academic data on input change
const updateAcademicItem = (index, field, value) => {
    if (dynamicData.academic[index]) {
        dynamicData.academic[index][field] = value;
    }
};

// Updates simple array data (like projects) on input change
const updateDynamicItem = (arrayName, index, value) => {
    if (dynamicData[arrayName][index] !== undefined) {
        dynamicData[arrayName][index] = value;
    }
};

// Gathers all form and dynamic data for saving to the back-end
const getFormDataForSave = () => {
    // Collect static fields directly
    const data = {
        fullName: document.getElementById('fullName').value,
        contact: document.getElementById('contact').value,
        bio: document.getElementById('bio').value,
        photoUrl: document.getElementById('photoUrl').value,
        
        // Pass dynamic arrays directly
        skills: dynamicData.skills,
        academic: dynamicData.academic.filter(a => a.institute), // Filter out incomplete academic entries
        projects: dynamicData.projects.filter(p => p.trim()),
        
        // Simplified work experience (requires manual input setup in HTML/JS for full dynamic support)
        workExperience: [{ companyName: "Sample Co", duration: "1 Year", responsibilities: ["Task 1", "Task 2"] }]
    };
    return data;
};


// --- Authentication Logic (Fix for the page reload issue) ---

// Handles submission for both Login and Register forms
const handleAuth = (formId, endpoint) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        // *** CRITICAL FIX: PREVENT DEFAULT RELOAD ***
        e.preventDefault(); 
        
        const messageEl = document.getElementById('message');
        messageEl.textContent = ''; // Clear previous messages
        
        // Data collection for authentication is simple (email, password)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Status 200 (Login) or 201 (Register)
                localStorage.setItem('jwt', result.token);
                displayMessage('message', result.message, 'success');
                // Redirect on success
                setTimeout(() => {
                    window.location.href = 'portfolio-form.html';
                }, 500);
            } else {
                // Authentication failure (Status 400 or 401)
                displayMessage('message', result.error || 'Authentication failed. Check console for details.', 'error');
            }
        } catch (error) {
            // Network failure
            displayMessage('message', 'Network error. Could not reach server.', 'error');
            console.error("Fetch Error:", error);
        }
    });
};


// --- Portfolio Load/Save (Lab 4, Task 2) ---

const loadPortfolio = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/portfolio`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` } // Pass JWT
        });
        
        if (response.status === 401) return; // Handled by token guard

        const data = await response.json();
        
        if (data && data.fullName) {
            // Populate static fields
            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('contact').value = data.contact || '';
            document.getElementById('bio').value = data.bio || '';
            document.getElementById('photoUrl').value = data.photoUrl || '';
            
            // Update dynamic data and render UI
            dynamicData.skills = data.skills || [];
            dynamicData.academic = data.academic || [];
            dynamicData.projects = data.projects || [];
            
            renderSkills();
            renderAcademic();
            renderProjects();

            displayMessage('statusMessage', 'Last saved portfolio loaded.', 'info');
        }

    } catch (error) {
        displayMessage('statusMessage', 'Error loading portfolio data.', 'error');
    }
};


const savePortfolio = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt');
    const data = getFormDataForSave();

    try {
        const response = await fetch(`${BACKEND_URL}/portfolio`, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            displayMessage('statusMessage', result.message, 'success');
        } else {
            displayMessage('statusMessage', result.error || 'Failed to save portfolio.', 'error');
        }

    } catch (error) {
        displayMessage('statusMessage', 'Network error. Could not save data.', 'error');
    }
};


// --- PDF Generation Logic (Lab 4, Task 2) ---

const generatePDF = () => {
    // Hide all form controls before generating PDF
    const formControls = document.querySelectorAll('button, input, textarea');
    formControls.forEach(el => el.style.display = 'none');

    const element = document.getElementById('portfolio-content-to-print'); 
    
    const opt = {
        margin: 0.5,
        filename: 'MyDynamicPortfolio.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
    
    // Restore the form controls after a short delay
    setTimeout(() => {
        formControls.forEach(el => el.style.display = '');
    }, 1000); 
};


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication forms
    if (document.getElementById('registerForm')) {
        handleAuth('registerForm', 'register');
    }

    if (document.getElementById('loginForm')) {
        handleAuth('loginForm', 'login');
    }

    // Initialize portfolio form
    if (document.getElementById('portfolioForm')) {
        loadPortfolio(); 
        document.getElementById('portfolioForm').addEventListener('submit', savePortfolio);
        
        // Initial render for dynamic fields
        renderSkills();
        renderAcademic();
        renderProjects();
    }
});