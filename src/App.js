
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Footer from "./components/Footer";
import Search from "./Pages/Search";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/404";
import ContactUs from "./Pages/contactUs";
import { default as SettingsProfile } from "./Pages/settings/Profile";
import {default as SettingsExperience} from "./Pages/settings/Experience";
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

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;
axios.defaults.timeout = 5000;
axios.defaults.cancelToken = null;

function App() {
    return (
        <Account>
            <Router>
                <Routes>
                    <Route path="/" element={components(<Navbar />, <Home />, <Footer />)} />
                    <Route path="/about" element={components(<Navbar />, <About />, <Footer />)} />
                    <Route path="/search" element={components(<Navbar />, <Search />, <Footer />)} />

                    <Route path="/settings" element={<Navigate to="/settings/profile" />} />
                    <Route path="/settings/profile" element={components(<Navbar />, <SettingsProfile />, <Footer />)} />
                    <Route path="/settings/experience" element={components(<Navbar />, <SettingsExperience />, <Footer />)} />

                    <Route path="/profile" element={components(<Navbar />, <Profile />, <Footer />)} />
                    <Route path="/profile/:user_id" element={components(<Navbar />, <Profile />, <Footer />)} />

                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />

                    <Route path="/404" element={components(<Navbar />, <NotFound />, <Footer />)} />
                    <Route path="*" element={<Navigate to="/404" />} />
                    <Route path="/contactUs" element={components(<Navbar/>, <ContactUs/> ,<Footer/>)}/>
                </Routes>
            </Router>
        </Account>
    );
}

export default App;
