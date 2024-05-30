
/*async function getUserStats() {

	const response = await fetch('/getuser/',
	{
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': '{{ csrf_token }}',
			'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
		},
	});
	const data = await response.json();
	if (data.error) {
		alert(data.error);
		return null;
	} else {
		return data;
	}
}

// add event listener to the stats button
document.addEventListener('DOMContentLoaded', function() {
	const statsButton = document.querySelector('#stats-button');
	const statsSection = document.querySelector('#stats');

	statsButton.addEventListener('click', function(event) {
		event.preventDefault();
		window.location.href = STATS_HREF;
	});
});

// Fetch all users data from the backend
function fetchAllUsers() {
    // Make a request to your backend API to fetch all users data
    // Replace this with your actual API endpoint
    fetch('/api/all-users')
        .then(response => response.json())
        .then(data => {
            // Update the all users table with fetched data
            const allUsersBody = document.getElementById('all-users-body');
            allUsersBody.innerHTML = ''; // Clear previous entries
            data.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.wins}</td>
                    <td>${user.loss}</td>
                    <td>${user.difference}</td>
                    <td>${user.winPercentage}%</td>
                    <td>${user.gamesPlayed}</td>
                    <td><button onclick="viewProfile('${user.username}')">View Profile</button></td>
                `;
                allUsersBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching all users:', error);
        });
}

// Function to view profile of a user
function viewProfile(username) {
    // Implement logic to navigate to the profile page of the specified user
}

// Call the fetchAllUsers function when the profile section is displayed
document.addEventListener('DOMContentLoaded', fetchAllUsers);

*/

/*document.querySelector('#stats-button').addEventListener('click', function() {
    fetch('player-stats/', {  // Change this to the URL of the new API endpoint
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log('Data:', data);
        console.log(`Username: ${data.username}`);
        console.log(`Number of wins: ${data.wins}`);
        console.log(`Number of losses: ${data.losses}`);
        console.log(`Number of games played: ${data.games_played}`);
        console.log(`Win rate: ${data.win_rate}`);
        console.log(`Win-loss difference: ${data.win_loss_difference}`);
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
});


/* document.querySelector('#stats-button').addEventListener('click', function() {
    fetch('match-history/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        // Assuming data is an array of matches
        data.forEach(match => {
            const matchElement = document.createElement('p');
            matchElement.textContent = `Username: ${match.winner}, Number of wins: ${match.wins}`;
            document.querySelector('#your-container-id').appendChild(matchElement);
        });
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
});
 */

// Select the node that will be observed for mutations
const targetNode1 = document.getElementById('pong');
const targetNode2 = document.getElementById('double-pong');

// Options for the observer (which mutations to observe)
const config = { attributes: true, attributeFilter: ['style'] };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
            console.log('Current display: ', window.getComputedStyle(this).display);
            if (window.getComputedStyle(this).display === 'none') {
                var data = localStorage.getItem('gameData');
                if (data) {
                    // Parse the JSON string to an object
                    var jsonData = JSON.parse(data);
                    console.log('here is the data: ', jsonData);
                    // Define the URL of your API
                    const url = 'match-history/'; // Replace with your actual API URL

                    // Send a POST request to the API
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // Include your JWT token in the 'Authorization' header
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Replace 'yourToken' with the actual token
                        },
                        body: JSON.stringify(jsonData),
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                } else {
                    console.log('gameData not found');
                }
            }
        }
    }
};

// Create an observer instance linked to the callback function
const observer1 = new MutationObserver(callback.bind(targetNode1));
const observer2 = new MutationObserver(callback.bind(targetNode2));

// Start observing the target node for configured mutations
observer1.observe(targetNode1, config);
observer2.observe(targetNode2, config);