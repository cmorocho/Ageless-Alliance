var ref;

(function (jQuery, Firebase) {
    "use strict";

    // the main firebase reference
    ref = new Firebase("https://ageless-link.firebaseio.com/web/uauth");

}(window.jQuery, window.Firebase));

/*
check if a user is already logged in
 */
var authData = ref.getAuth();
if (authData) {
    updateToLogout();
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
} else {
    updateToLogin();
    console.log("User is logged out");
}

/*
    change login/logout indicator
 */
function updateToLogout() {
    document.getElementById('login-indicator').innerHTML = "<a href='user_accounts/account-official.html' class='link' style='text-transform: uppercase'>Hi, <b>name</b></a>";
    document.getElementById('login-indicator2').innerHTML = "<a href='#' class='btn btn-accent btn-small' onclick='logout()'>Logout</a>";
}
function updateToLogin() {
    document.getElementById('login-indicator').innerHTML = "<a href='login.html' class='link'>Log in</a>";
    document.getElementById('login-indicator2').innerHTML = "<a href='signup.html' class='btn btn-accent btn-small'>Sign up</a>";
}

/*
    create new user
 */
function createAccount() {
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
            redirectToLogin();
        }
    });
}
function redirectToLogin() {
    window.location.href = 'login.html';
}

/*
    login
 */
function login(newEmail, newPassword) {
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
            redirectToUserPage();
        }
    });
}
function redirectToUserPage() {
    var authData = ref.getAuth();
    if(authData) window.location = 'user_accounts/account-official.html';
}

/*
    logout
 */
function logout() {
    updateToLogin();
    ref.unauth();
    if(!authData) window.location = 'index.html';
}