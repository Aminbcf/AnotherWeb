


const candidateId = localStorage.getItem('candidateId'); // or retrieve from login
const moduleId = 1; // e.g., WAD = 1

fetch(`http://localhost:3000/candidate/${candidateId}/module/${moduleId}/check`)
    .then(res => res.json())
    .then(data => {
        if (data.alreadySubmitted) {
            alert('You already completed this exam. Redirecting to main page.');
            window.location.href = 'main.html';
        }
    });


//bottons function to scroll DO NOT TOUCH IT!!
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

//function to display the timer
let totalSeconds = 300;
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const interval = setInterval(() => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerElement.textContent = `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    totalSeconds--;
    if (totalSeconds < 0) {
        clearInterval(interval);
        disableInputs();
        submitExam();
    }
}, 1000);

function disableInputs() {
    document.querySelectorAll('input').forEach(input => input.disabled = true);
}
function submitExam(moduleId) {
    disableInputs();
    let score = 0;

    for (let i = 1; i <= 20; i++) {
        const correctAnswer = document.querySelector(`input[name="q${i}"][value="correct"]`);
        const selectedAnswer = document.querySelector(`input[name="q${i}"]:checked`);
  
        if (selectedAnswer && selectedAnswer === correctAnswer) {
          score++;
        }
      }

    scoreElement.textContent = `Your score: ${score}/20`;

    // Save score to database
    const candidateId = localStorage.getItem('candidateId');
    console.log(candidateId)

    fetch('http://localhost:3000/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            candidateId: localStorage.getItem('candidateId'),
            moduleId: moduleId,
            grade: score,
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'main.html';
            }
        });

}

 function exitExam() {
    let allAnswered = true;

    for (let i = 1; i <= 20; i++) {
      const answered = document.querySelector(`input[name="q${i}"]:checked`);
      if (!answered) {
        allAnswered = false;
        break; // no need to continue if one is missing
      }
    }
    const candidateId = localStorage.getItem('candidateId');
    const moduleId = 1; // adjust accordingly

    function saveScoreAndExit(score) {
        fetch(`http://localhost:3000/candidate/${candidateId}/module/${moduleId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: score })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Score saved (exit case)');
                } else {
                    console.warn('Failed to save score:', data.message);
                }
                window.location.href = "../main.html";
            })
            .catch(err => {
                console.error('Error saving score on exit:', err);
                window.location.href = "../main.html";
            });
    }

    if (allAnswered) {
        const confirmExit = confirm("You have answered all questions. Do you want to exit?");
        if (confirmExit) {

        }
    } else {
        const confirmQuit = confirm("You haven't answered all questions. If you quit now, your score will be 0. Do you really want to quit?");
        if (confirmQuit) {
            alert("You quit the exam. Your score is 0.");
            saveScoreAndExit(0); // score is 0
        }
    }
}
