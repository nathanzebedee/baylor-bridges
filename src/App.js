import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./Pages/Home";
import About from "./Pages/About";
import ContactUs from "./Pages/ContactUs";
import NotFound from "./Pages/404";

import PrivacyPolicy from "./Pages/policies&terms/PrivacyPolicy";
import TermsConditions from "./Pages/policies&terms/Terms&Conditions";
import CookiePolicy from "./Pages/policies&terms/CookiePolicy";

import SignIn from "./Pages/signin/SignIn";
import ResetPassword from "./Pages/signin/ResetPassword";
import { default as SignInChallenge } from "./Pages/signin/Challenge";
import { default as SignUpEntrace } from "./Pages/signup/Entrace";
import { default as SignUpForm } from "./Pages/signup/Form";
import { default as SignUpClosed } from "./Pages/signup/Closed";


import Search from "./Pages/Search";
import Profile from "./Pages/Profile";

import { default as SettingsProfile } from "./Pages/settings/Profile";
import { default as SettingsExperience } from "./Pages/settings/Experience";
import { default as SettingsAccount } from "./Pages/settings/Account";
import { Account } from "./components/Account";

import "./App.css";

function components(...components) {
    return (
        <>
            {components.map(component => component)}
        </>
    );
}

axios.defaults.headers = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
    "Access-Control-Allow-Origin": "*",
};


// Make API Base URL
const hostname = window.location.hostname;
const port = window.location.port;
if (hostname === "localhost" || hostname === "127.0.0.1" || port === 3000) {
    axios.defaults.baseURL = `http://${hostname}:5000`;
    console.log("Running on Localhost", axios.defaults.baseURL);
} else {
    axios.defaults.baseURL = `https://api.${hostname}`;
    console.log("Running on Production", axios.defaults.baseURL);
}

axios.defaults.withCredentials = true;
axios.defaults.timeout = 8000;
axios.defaults.timeoutErrorMessage = "time out";
axios.defaults.cancelToken = null;
axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // If unauthorized access, redirected to sign in page
    if (!error.response.config.withoutInterceptors && error.response.status === 401) {
        window.location.href = "/sign-in";
        return;
    }

    return Promise.reject(error);
});

function App() {
    return (
        <Account>
            <Router>
                <Routes>
                    <Route path="/" element={components(<Navbar />, <Home />, <Footer />)} />
                    <Route path="/about" element={components(<Navbar />, <About />, <Footer />)} />
                    <Route path="/search" element={components(<Navbar />, <Search />, <Footer />)} />

                    <Route path="/settings" element={<Navigate to="/settings/account" />} />
                    <Route path="/settings/profile" element={components(<Navbar />, <SettingsProfile />, <Footer />)} />
                    <Route path="/settings/experience" element={components(<Navbar />, <SettingsExperience />, <Footer />)} />
                    <Route path="/settings/account" element={components(<Navbar />, <SettingsAccount />, <Footer />)} />

                    <Route path="/profile" element={components(<Navbar />, <Profile />, <Footer />)} />
                    <Route path="/profile/:user_id" element={components(<Navbar />, <Profile />, <Footer />)} />

                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/reset-password" element={<ResetPassword />}/>
                    <Route path="/sign-in/challenge" element={<SignInChallenge />} />

                    <Route path="/sign-up" element={<SignUpEntrace />} />
                    <Route path="/sign-up/:role" element={<SignUpForm />} />
                    <Route path="/sign-up/closed" element={<SignUpClosed />} />

                    <Route path="/contact-us" element={components(<Navbar />, <ContactUs />, <Footer />)} />

                    <Route path="/terms/privacy-policy" element={components(<Navbar />, <PrivacyPolicy />, <Footer />)} />
                    <Route path="/terms/terms-conditions" element={components(<Navbar />, <TermsConditions />, <Footer />)} />
                    <Route path="/terms/cookies-policy" element={components(<Navbar />, <CookiePolicy />, <Footer />)} />

                    <Route path="/404" element={components(<NotFound />)} />
                    <Route path="*" element={<Navigate to="/404" />} />

                </Routes>
            </Router>
        </Account>
    );
}

export default App;