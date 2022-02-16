import React, { useState, useContext } from "react";
import { XCircleIcon } from "@heroicons/react/solid";

import { AccountContext } from "../../components/Account";
import Password from "../../components/Password";

const SignInChallenge = () => {

    const { authChallenge } = useContext(AccountContext);

    const [loading, setLoading] = useState(false);
    const [error_message, setErrorMessage] = useState(null);
    const [response, setResponse] = useState(null);
    const [success, setSuccess] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get("session");
    const name = urlParams.get("name");
    const sub = urlParams.get("sub");

    console.log(name, sub);

    const challenges = {
        "NEW_PASSWORD_REQUIRED": {
            form: (
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Set your new password
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                            You are required to set a new password for your account.
                            Please enter a new password.
                        </p>
                    </div>
                    <div className="mt-5 sm:flex sm:items-center">
                        <Password
                            value={
                                (password, check) => {
                                    setResponse({ ...response, new_password: password, username: sub });
                                }
                            }
                        />
                    </div>
                </div>
            ),
            success: (
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Your new password is set
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                            For future sign in, please use your new password.
                        </p>
                    </div>
                </div>
            ),
            submit: () => {
                console.log(response);

                authChallenge(name, session, response).then(response => {
                    // window.location.href = "/";
                    setSuccess(true);
                }).catch(error => {
                    setErrorMessage(error.response.data.message);
                }).finally(() => {
                    setLoading(false); 
                });
            },
            done: () => {
                window.location.href = "/";
            }
        }
    };

    // If it is an undefined challenge, then it is an error (Or could be a challenge have not been implemented yet)
    if (challenges[name] === undefined) {
        window.location.href = "/404";   
    }

    const onSubmit = (event) => {
        setLoading(true);
        challenges[name].submit();
    };

    return (
        <>
            <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <a className="sm:mx-auto sm:w-full sm:max-w-md" href="/">
                    <img
                        className="mx-auto h-20 w-auto"
                        src="/Baylor-University-Athletics-01.svg"
                        alt="Workflow"
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </a>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="space-y-6">
                            {/* Error message */}
                            {
                                error_message !== null &&
                                <div className="bg-red-50 rounded-md p-4 mt-3">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-2">
                                            <div className="text-red-700 text-sm">
                                                <ul className="">
                                                    <li>{error_message}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                            {/* Challenge Form */}
                            {success === false && challenges[name].form}
                            {success === true && challenges[name].success}

                            {
                                success === false &&
                                <div>
                                    <button
                                        type="submit"
                                        className={`${loading ? "cursor-not-allowed" : ""} w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                                        onClick={onSubmit}
                                        {...(loading ? { disabled: true } : {})}
                                    >
                                        {
                                            loading &&
                                            <svg className="cursor-not-allowed animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fillOpacity="0"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        }
                                        {
                                            !loading &&
                                            "Submit"
                                        }
                                    </button>
                                </div>
                            }
                            {
                                success === true &&
                                <div>
                                    <button
                                        type="submit"
                                        className={`${loading ? "cursor-not-allowed" : ""} w-full flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                                        onClick={challenges[name].done}
                                    >
                                        Complete
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignInChallenge;