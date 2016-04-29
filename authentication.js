var ref, dataRef;

(function (jQuery, Firebase) {
    "use strict";

    // the main firebase authorization reference
    ref = new Firebase("https://ageless-link.firebaseio.com/web/uauth");
    dataRef = new Firebase("https://ageless-link.firebaseio.com");

}(window.jQuery, window.Firebase));

/*
check if a user is already logged in
 */
var authData = ref.getAuth();
if (authData) {
    update_to_logout();
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
} else {
    update_to_login();
    console.log("User is logged out");
}

/*
    change login/logout indicator
 */
function update_to_logout() {
    dataRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if(data.key() == authData.uid) {
                document.getElementById('login-indicator').innerHTML = "<a href='user_accounts/account-official.html' class='link' style='text-transform: none'>Hi, <b>" + data.val().name + "</b></a>";
                document.getElementById('login-indicator2').innerHTML = "<a href='#' class='btn btn-accent btn-small' onclick='logout()'>Logout</a>";
            }
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_to_login() {
    document.getElementById('login-indicator').innerHTML = "<a href='login.html' class='link'>Log in</a>";
    document.getElementById('login-indicator2').innerHTML = "<a href='signup.html' class='btn btn-accent btn-small'>Sign up</a>";
}

/*
    create new user
 */
function create_account() {
    var newEmail = document.getElementById("txtEmail").value,
        newPassword = document.getElementById("txtPass").value;
    ref.createUser({
        email    : newEmail,
        password : newPassword
    }, function(error, userData) {
        if (error) {
            console.log("Error creating user:", error);
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
            add_new_user_to_database(userData, newEmail);
            redirect_to_login();
        }
    });
}
// add to database
function add_new_user_to_database(userData, email) {
    var today = new Date(),
        month = (today.getMonth()+ 1).toString(),
        year = (today.getFullYear()).toString();
    console.log(month + "/" + year);
    dataRef.child(userData.uid).set({
        name: get_name(email),
        join_date: month + "/" + year,
        volunteer_status: "unofficial"
    });
}
function get_name(email) {
    return email.replace(/@.*/, '');
}
function redirect_to_login() {
    window.location.href = 'login.html';
}

/*
    login
 */
function login() {
    var logEmail = document.getElementById("loginEmail").value,
        logPassword = document.getElementById("loginPassword").value;
    ref.authWithPassword({
        email    : logEmail,
        password : logPassword
    }, function(error, authData) {
        if (error) {
            console.log("Login Failed!", error);
        } else {
            console.log("Authenticated successfully with payload:", authData);
            redirect_to_user_page();
        }
    });
}
function redirect_to_user_page() {
    var authData = ref.getAuth();
    if(authData) window.location = 'user_accounts/account-official.html';
}

/*
    logout
 */
function logout() {
    ref.unauth();
    update_to_login();
    window.location = 'index.html';
}