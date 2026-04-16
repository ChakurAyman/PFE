const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const showSignUp = document.getElementById('showSignUp');
const showSignIn = document.getElementById('showSignIn');

function activateForm(formToShow) {
  signInForm.classList.toggle('auth-form--active', formToShow === 'signIn');
  signUpForm.classList.toggle('auth-form--active', formToShow === 'signUp');
}

showSignUp.addEventListener('click', () => activateForm('signUp'));
showSignIn.addEventListener('click', () => activateForm('signIn'));

signInForm.addEventListener('submit', event => {
  event.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value.trim();
  if (email && password) {
    window.location.href = 'index.html';
  }
});

signUpForm.addEventListener('submit', event => {
  event.preventDefault();
  alert('Account creation submitted.');
});
