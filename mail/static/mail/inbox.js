
document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
  
    // By default, load the inbox
    load_mailbox('inbox');

    document.querySelector('#compose-form').onsubmit = send;
});


function compose_email() {
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('.email_details').style.display = 'none';
    document.querySelector('.email_details').innerHTML = '';
    
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}
  
function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('.email_details').style.display = 'none';
    document.querySelector('.email_details').innerHTML = '';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // ... do something else with emails ...
        
        emails.forEach((email) => {
            const element = document.createElement('div');
            element.innerHTML = `Sender: ${email.sender}, Subject: ${email.subject}, Timestamp: ${email.timestamp}`;

            element.style.border = "thick solid #000";
            element.classList.add("mt-3");
            element.style.fontSize = "20px";

            if (email.read === true) {
                element.style.backgroundColor = "gray";
            } else {
                element.style.backgroundColor = "white";
            }

            element.addEventListener("mouseenter", (event) => {
                // highlight the mouseenter target
                event.target.style.color = "purple";

                // reset the color after a short delay
                setTimeout(() => {
                    event.target.style.color = "";
                }, 500);
            }, false);

            element.addEventListener('click', () => {
            //show the email details
            fetch(`/emails/${email.id}`)
                .then(response => response.json())
                .then(email => {
                    // Print email
                    console.log(email);

                    // ... PUT email.id read ...
                    fetch(`/emails/${email.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                    });

                    document.querySelector('#emails-view').style.display = 'none';
                    document.querySelector('.email_details').style.display = 'block';

                    let email_details = document.createElement('div');

                    email_details.innerHTML = `<h4>Sender: ${email.sender}</h4> <h4>Recipients: ${email.recipients}</h4><h4>Subject: 
                    ${email.subject}</h4><h4>Timestamp: ${email.timestamp}</h4><h4>body:</h4><br></br> <h5>${email.body}</h5>`;

                    document.querySelector('.email_details').append(email_details);
                    if (mailbox !== 'sent') {
                        let archive = document.createElement("button");
                        let isArchived = false;

                        if (email.archived) {
                            archive.innerHTML = "Unarchive";
                            isArchived = false;

                        } else {

                            archive.innerHTML = "Archive";
                            isArchived = true;
                        }
                        archive.classList.add("btn", "btn-dark", "mr-2");

                        archive.addEventListener("click", () => {
                            fetch(`/emails/${email.id}`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    archived: isArchived
                                })
                            });
                            location.reload();
                            load_mailbox('inbox');
                        });
                        document.querySelector('.email_details').appendChild(archive);
                    }
                    let reply = document.createElement("button");

                    reply.innerHTML = "Reply";
                    reply.classList.add("btn", "btn-dark");

                    reply.addEventListener("click", () => {
                        compose_email();
                        document.querySelector('#compose-recipients').value = email.sender;

                        if (!(email.subject.startsWith("Re:"))) {
                            email.subject = `Re: ${email.subject}`;
                        }

                        document.querySelector('#compose-subject').value = email.subject;
                        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
                    });

                    document.querySelector('.email_details').appendChild(reply);
                });
            });

            document.querySelector('#emails-view').append(element);
        });
            
    });
}

function send() {
    let Recipient = document.querySelector('#compose-recipients').value;
    let Subject = document.querySelector('#compose-subject').value;
    let Body = document.querySelector('#compose-body').value;

    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: Recipient,
        subject: Subject,
        body: Body
    })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    });

    load_mailbox('sent');
    return false;
}

