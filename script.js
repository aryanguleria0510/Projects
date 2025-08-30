// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const workoutGrid = document.getElementById('workout-grid');
const addWorkoutBtn = document.getElementById('add-workout-btn');
const workoutModal = document.getElementById('workout-modal');
const workoutForm = document.getElementById('workout-form');
const closeModal = document.querySelector('.close');
const goalForm = document.getElementById('goal-form');
const goalsList = document.getElementById('goals-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressChart = document.getElementById('progress-chart');

// Data Storage
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentFilter = 'all';

// Sample workout data
const sampleWorkouts = [
    {
        id: 1,
        name: 'Full Body Strength',
        type: 'strength',
        duration: 45,
        description: 'Complete full body workout targeting all major muscle groups with compound movements.',
        calories: 350
    },
    {
        id: 2,
        name: 'HIIT Cardio',
        type: 'cardio',
        duration: 30,
        description: 'High-intensity interval training to boost cardiovascular fitness and burn calories.',
        calories: 400
    },
    {
        id: 3,
        name: 'Yoga Flow',
        type: 'flexibility',
        duration: 60,
        description: 'Gentle yoga session focusing on flexibility, balance, and mindfulness.',
        calories: 200
    },
    {
        id: 4,
        name: 'Upper Body Focus',
        type: 'strength',
        duration: 40,
        description: 'Targeted upper body workout for chest, back, shoulders, and arms.',
        calories: 300
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCurrentDate();
    loadSampleData();
    renderWorkouts();
    renderGoals();
    updateProgressStats();
    initializeProgressChart();
});

// Initialize the application
function initializeApp() {
    // Set current date
    updateCurrentDate();
    
    // Initialize navigation
    setupNavigation();
    
    // Load data from localStorage or use sample data
    if (workouts.length === 0) {
        workouts = [...sampleWorkouts];
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Workout modal
    addWorkoutBtn.addEventListener('click', openWorkoutModal);
    closeModal.addEventListener('click', closeWorkoutModal);
    workoutModal.addEventListener('click', (e) => {
        if (e.target === workoutModal) closeWorkoutModal();
    });
    
    // Forms
    workoutForm.addEventListener('submit', handleWorkoutSubmit);
    goalForm.addEventListener('submit', handleGoalSubmit);
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navigation functions
function setupNavigation() {
    // Update active nav link based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

function handleNavClick(e) {
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    e.target.classList.add('active');
    
    // Close mobile menu if open
    if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Date and time functions
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = dateString;
}

// Workout functions
function openWorkoutModal() {
    workoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeWorkoutModal() {
    workoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    workoutForm.reset();
}

function handleWorkoutSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(workoutForm);
    const workout = {
        id: Date.now(),
        name: formData.get('workout-name') || document.getElementById('workout-name').value,
        type: formData.get('workout-type') || document.getElementById('workout-type').value,
        duration: parseInt(formData.get('workout-duration') || document.getElementById('workout-duration').value),
        description: formData.get('workout-description') || document.getElementById('workout-description').value,
        calories: Math.floor(Math.random() * 200) + 200 // Random calories for demo
    };
    
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    renderWorkouts();
    closeWorkoutModal();
    showNotification('Workout added successfully!', 'success');
}

function renderWorkouts() {
    const filteredWorkouts = currentFilter === 'all' 
        ? workouts 
        : workouts.filter(workout => workout.type === currentFilter);
    
    workoutGrid.innerHTML = filteredWorkouts.map(workout => `
        <div class="workout-card" data-id="${workout.id}">
            <div class="workout-header">
                <span class="workout-type ${workout.type}">${workout.type}</span>
                <button class="edit-btn" onclick="editWorkout(${workout.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <h3 class="workout-title">${workout.name}</h3>
            <p class="workout-duration">
                <i class="fas fa-clock"></i> ${workout.duration} minutes
            </p>
            <p class="workout-description">${workout.description}</p>
            <div class="workout-actions">
                <button class="action-btn start-btn" onclick="startWorkout(${workout.id})">
                    <i class="fas fa-play"></i> Start
                </button>
                <button class="action-btn edit-btn" onclick="editWorkout(${workout.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `).join('');
}

function handleFilterClick(e) {
    // Remove active class from all filter buttons
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    e.target.classList.add('active');
    
    // Update current filter
    currentFilter = e.target.dataset.filter;
    
    // Re-render workouts
    renderWorkouts();
}

function startWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
        showNotification(`Starting ${workout.name}...`, 'info');
        // Simulate workout completion
        setTimeout(() => {
            updateProgressStats();
            showNotification(`${workout.name} completed! Great job!`, 'success');
        }, 2000);
    }
}

function editWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
        // Populate modal with workout data
        document.getElementById('workout-name').value = workout.name;
        document.getElementById('workout-type').value = workout.type;
        document.getElementById('workout-duration').value = workout.duration;
        document.getElementById('workout-description').value = workout.description;
        
        openWorkoutModal();
        
        // Update form submission to handle edit
        workoutForm.onsubmit = (e) => {
            e.preventDefault();
            workout.name = document.getElementById('workout-name').value;
            workout.type = document.getElementById('workout-type').value;
            workout.duration = parseInt(document.getElementById('workout-duration').value);
            workout.description = document.getElementById('workout-description').value;
            
            localStorage.setItem('workouts', JSON.stringify(workouts));
            renderWorkouts();
            closeWorkoutModal();
            showNotification('Workout updated successfully!', 'success');
            
            // Reset form submission handler
            workoutForm.onsubmit = handleWorkoutSubmit;
        };
    }
}

// Goal functions
function handleGoalSubmit(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        title: document.getElementById('goal-title').value,
        type: document.getElementById('goal-type').value,
        target: parseFloat(document.getElementById('goal-target').value),
        deadline: document.getElementById('goal-deadline').value,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(goals));
    
    renderGoals();
    goalForm.reset();
    showNotification('Goal added successfully!', 'success');
}

function renderGoals() {
    goalsList.innerHTML = goals.map(goal => {
        const progressPercentage = (goal.progress / goal.target) * 100;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-item" data-id="${goal.id}">
                <div class="goal-header">
                    <h4 class="goal-title">${goal.title}</h4>
                    <span class="goal-type ${goal.type}">${goal.type}</span>
                </div>
                <div class="goal-details">
                    <p>Target: ${goal.target} ${getGoalUnit(goal.type)}</p>
                    <p>Progress: ${goal.progress} ${getGoalUnit(goal.type)}</p>
                    <p>Deadline: ${new Date(goal.deadline).toLocaleDateString()}</p>
                    <p>Days left: ${daysLeft > 0 ? daysLeft : 'Overdue'}</p>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                    </div>
                    <p style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem;">
                        ${Math.round(progressPercentage)}% Complete
                    </p>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="updateGoalProgress(${goal.id})" style="flex: 1; padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Update Progress
                    </button>
                    <button onclick="deleteGoal(${goal.id})" style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getGoalUnit(type) {
    const units = {
        weight: 'kg',
        strength: 'lbs',
        endurance: 'minutes',
        flexibility: 'inches'
    };
    return units[type] || '';
}

function updateGoalProgress(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        const progress = prompt(`Enter current progress for "${goal.title}" (${getGoalUnit(goal.type)}):`, goal.progress);
        if (progress !== null && !isNaN(progress)) {
            goal.progress = parseFloat(progress);
            localStorage.setItem('goals', JSON.stringify(goals));
            renderGoals();
            updateProgressStats();
            showNotification('Progress updated!', 'success');
        }
    }
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(g => g.id !== goalId);
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
        showNotification('Goal deleted!', 'info');
    }
}

// Progress tracking functions
function updateProgressStats() {
    // Simulate progress data
    const currentWeight = 75 + Math.random() * 5;
    const bodyFat = 15 + Math.random() * 5;
    const weeklyWorkouts = Math.floor(Math.random() * 5) + 2;
    const weeklyCalories = weeklyWorkouts * 300 + Math.random() * 200;
    
    document.getElementById('current-weight').textContent = `${currentWeight.toFixed(1)} kg`;
    document.getElementById('body-fat').textContent = `${bodyFat.toFixed(1)}%`;
    document.getElementById('weekly-workouts').textContent = weeklyWorkouts;
    document.getElementById('weekly-calories').textContent = Math.round(weeklyCalories);
    
    // Update hero summary
    document.getElementById('calories-burned').textContent = Math.round(weeklyCalories / 7);
    document.getElementById('workout-time').textContent = `${weeklyWorkouts * 45} min`;
    document.getElementById('goals-completed').textContent = goals.filter(g => g.progress >= g.target).length;
}

function initializeProgressChart() {
    if (progressChart) {
        const ctx = progressChart.getContext('2d');
        
        // Sample weekly data
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Calories Burned',
                data: [320, 450, 280, 380, 420, 350, 400],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };
        
        new Chart(ctx, config);
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function loadSampleData() {
    // Load sample data if no data exists
    if (goals.length === 0) {
        const sampleGoals = [
            {
                id: 1,
                title: 'Lose 5kg',
                type: 'weight',
                target: 5,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: 2,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Run 10km',
                type: 'endurance',
                target: 60,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: 30,
                createdAt: new Date().toISOString()
            }
        ];
        goals = sampleGoals;
        localStorage.setItem('goals', JSON.stringify(goals));
    }
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.workout-card, .nutrition-card, .goal-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add Chart.js for progress chart
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = initializeProgressChart;
    document.head.appendChild(script);
} else {
    initializeProgressChart();
}
