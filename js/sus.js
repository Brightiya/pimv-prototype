const susQuestions = [
    "I think that I would like to use this system frequently.",
    "I found the system unnecessarily complex.",
    "I thought the system was easy to use.",
    "I think that I would need the support of a technical person to use this system.",
    "I found the various functions in this system were well integrated.",
    "I thought there was too much inconsistency in this system.",
    "I would imagine that most people would learn to use this system very quickly.",
    "I found the system very cumbersome to use.",
    "I felt very confident using the system.",
    "I needed to learn a lot of things before I could get going with this system."
];

window.onload = () => {
    const container = document.getElementById("susQuestions");

    susQuestions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
            <label><strong>${index + 1}. ${q}</strong></label>
            <div class="scale">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
            <div class="scale">
                ${[1,2,3,4,5].map(val =>
                    `<label><input type="radio" name="q${index}" value="${val}" required></label>`
                ).join("")}
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById("susForm").addEventListener("submit", handleSubmit);
};

function handleSubmit(e) {
    e.preventDefault();

    let responses = [];
    for (let i = 0; i < 10; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        responses.push(Number(selected.value));
    }

    // Save to localStorage
    localStorage.setItem("susResponses", JSON.stringify(responses));

    const score = calculateSUS(responses);
    localStorage.setItem("susScore", score);

    document.getElementById("susScore").innerText = `Your SUS Score is: ${score}/100`;
    document.getElementById("susForm").classList.add("hidden");
    document.getElementById("susResult").classList.remove("hidden");
}

function calculateSUS(responses) {
    let total = 0;
    for (let i = 0; i < responses.length; i++) {
        if (i % 2 === 0) { 
            total += responses[i] - 1;     // odd questions
        } else {
            total += 5 - responses[i];     // even questions
        }
    }
    return total * 2.5; // convert to 0–100
}
