import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { SelectorIcon, CheckIcon, EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { toast } from "react-toastify";
import axios from "axios";

import Photo from "../../components/Photo";
import Button from "../../components/Button";
import Markdown from "../../components/Markdown";

import { classNames, states } from "../../components/Utils";


const x_fields = "user_id, first_name, last_name, headline, role, occupation, graduate_year, graduate_semester, city, state, biography, contact_info";

const semester = [
    { title: "Spring", value: "spring" },
    { title: "Fall", value: "fall" }
];

const visibility_options = [
    { title: "Self", value: "self", description: "Only visibie to yourself" },
    { title: "Alumni", value: "alumni", description: "Only visible to other alumni" },
    { title: "Public", value: "all", description: "Visibie to every user" },
];

const option_value_to_title = (options, value) => {
    // Find the option with the matching value
    const option = options.find(option => option.value === value);
    return option ? option.title : "";
};

const option_value_to_description = (options, value) => {
    // Find the option with the matching value
    const option = options.find(option => option.value === value);
    return option ? option.description : "";
};

const MarkdownIcon = () => {
    return (
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-markdown v-align-bottom">
            <path fillRule="evenodd" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"></path>
        </svg>
    );
};

const profile = {
    basic: {
        title: "Basic Information",
        description: "Your basic personal information will be shown publicly to everyone.",
        fields: {
            name: {
                title: "Name",
                attribute: [
                    { type: "text", title: "Prefix", placeholder: "Prefix", key: "prefix", role: "alumni" },
                    { type: "text", title: "First name", placeholder: "First name", key: "first_name", required: true },
                    { type: "text", title: "Last name", placeholder: "Last name", key: "last_name", required: true },
                ],
            },
            headline: {
                title: "Headline",
                attribute: { type: "text", maxLength: 100, title: "Headline", placeholder: "Headline", key: "headline" },
            },
            graduate_class_alumni: {
                title: "Graduate Class",
                role: "alumni",
                attribute: [
                    { type: "dropdown", title: "Semester", placeholder: "Semester", key: "graduate_semester", options: semester },
                    { type: "text", title: "Year", placeholder: "Year", key: "graduate_year" }
                ]
            },
            graduate_class_student: {
                title: "Expected Graduate Class",
                role: "student",
                attribute: [
                    { type: "dropdown", title: "Semester", placeholder: "Semester", key: "graduate_semester", options: semester },
                    { type: "text", title: "Year", placeholder: "Year", key: "graduate_year" }
                ]
            },
            occupation: {
                title: "Occupation",
                role: "alumni",
                attribute: { type: "text", title: "Occupation", placeholder: "Occupation", key: "occupation", role: "alumni" },
            },
            location: {
                title: "Location",
                attribute: [
                    { type: "text", title: "City", placeholder: "City", key: "city" },
                    { type: "dropdown", title: "State", placeholder: "State", key: "state", options: states },
                ],
            },
            biography: {
                title: "Biography",
                className: "sm:max-w-6xl",
                attribute: { type: "markdown-editor", title: "Biography", placeholder: "Biography", key: "biography" },
            },
        }
    },
    contact_info: {
        title: "Contact Information",
        description: "Manage your contact information and decide who can see them.",
        fields: {
            email: {
                title: "Email address",
                attribute: [
                    { type: "text", title: "Email address", placeholder: "Email address", key: "email" },
                    { type: "visibility", key: "email_visibility" },
                ]
            },
            phone: {
                title: "Phone number",
                attribute: [
                    { type: "text", title: "Phone number", placeholder: "Phone number", key: "phone" },
                    { type: "visibility", key: "phone_visibility" },
                ]
            },
        }
    },
};

const Profile = () => {
    const [account, setAccount] = useState(null);

    const [open, setOpen] = useState(false); // Whether modal is opened

    const [section_key, setSectionKey] = useState(null); // Current section key of the current fiels to change
    const [field, setField] = useState(null); // Current field to change in the modal
    const [update, setUpdate] = useState(null); // A dictionary to record everything need to be updated to axios

    const [loading, setLoading] = useState(false); // Whether the axios is requesting
    const [complete, setComplete] = useState(true); // Whether the fields in the modal are completed (prevent REQUIRED fields left empty)

    const [markdownEditorTab, setMarkdownEditorTab] = useState("edit");

    useEffect(() => {
        console.log(markdownEditorTab, markdownEditorTab === 0, markdownEditorTab === 1);
    }, [markdownEditorTab]);

    // First enter this page, fetch account profile data
    useEffect(() => {
        axios.get("/accounts/me", { headers: { "x-fields": x_fields } })
            .then(res => {
                setAccount(res.data);
                console.log(res.data);
            })
            .catch(err => toast.error(err.response.data.message));

    }, []);

    // When update field changed, check completeness
    useEffect(() => {
        // If no current field for modal, return
        if (!field) {
            return;
        }

        // Set complete to default true
        setComplete(true);

        if (!Array.isArray(field.attribute)) {
            field.attribute = [field.attribute];
        }

        // For all atomic attribute in this field, check if required ones are not empty
        let complete = true;
        let required = field.attribute.filter(value => value.required); // Fetch all REQUIRED atomic attribute
        required.forEach(value => {
            let _value = update[value.key];

            if (!_value || _value === "") {
                complete = false;
            }
        });

        setComplete(complete);
    }, [update, field]);

    // Get the raw value of a field, return either the field attribute value, or null, with the visibility value
    const getFieldDisplayValueRaw = (section_key, field) => {
        if (account === null) {
            return [null, null];
        }

        // Basic section would be from root, other sections from their sub-dictionary
        let account_from = account;

        // If not basic section, then get the sub-dictionary
        if (section_key !== "basic") {
            account_from = account[section_key];
        }

        // If field attribute is not an array, make it an array, with only itself
        if (!Array.isArray(field.attribute)) {
            field.attribute = [field.attribute];
        }

        // Initialize values
        let string = "";
        let visibility = null;

        // Traverse each atomic attribute
        field.attribute.forEach((attribute, index) => {
            if (attribute.key in account_from && account_from[attribute.key]) {
                // If visibility attribute, then get the visibility value
                // If other attribute, then get the value
                if (attribute.type === "visibility") {
                    visibility = account_from[attribute.key];
                } else {
                    if (attribute.type === "dropdown") {
                        string += option_value_to_title(attribute.options, account_from[attribute.key]) + " ";
                    } else {
                        string += account_from[attribute.key] + " ";
                    }
                }
            }
        });

        // Return values
        string = string.trim(); // Remove spaces
        if (string === "") {
            return [null, visibility];
        }
        return [string, visibility];
    };

    const getFieldDisplayValue = (section_key, field) => {
        // Photo - Return Photo component
        if (field.attribute && field.attribute.type === "photo") {
            return <Photo size="10" />;
        }

        // Other fields
        const [value, visibility] = getFieldDisplayValueRaw(section_key, field);
        if (value === null) {
            return <div className="text-gray-400">Not set</div>;
        } else {
            // If has visibility attribute, display eye/eyeoff icon
            // else, return just the value
            if (visibility !== null) {
                return (
                    <div className="flex items-center space-x-1">
                        <p>{value}</p>
                        {visibility !== "self" && <EyeIcon className="h-4 w-4 text-gray-400" />}
                        {visibility === "self" && <EyeOffIcon className="h-4 w-4 text-gray-400" />}
                    </div>
                );
            } else {
                return value;
            }
        }
    };

    // Get modal button for given field
    const getFieldModalButton = (section_key, field) => {
        // Make a button with given text
        const makeButton = (text) => {
            return (
                <button
                    type="button"
                    className="bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    onClick={() => onOpenFieldModal(section_key, field)}
                >
                    {text}
                </button>
            );
        };

        // Photo - Return special operations button for photo field - Update | Delete
        if (field.attribute === "photo") {
            return (
                <>
                    {makeButton("Update")}
                    <span className="text-gray-300 mt-2.5" aria-hidden="true">|</span>
                    {makeButton("Remove")}
                </>
            );
        }

        // Return different button according to raw value
        // eslint-disable-next-line no-unused-vars
        const [value, visibility] = getFieldDisplayValueRaw(section_key, field);

        if (value === null) {
            return makeButton("Set");
        } else {
            return makeButton("Update");
        }
    };


    const getFieldModal = (field) => {
        // Field has to be valid
        if (!field) {
            return;
        }

        const getAttributeDom = (attribute) => {
            // Put value validation condition when inputing here
            const isValidAttributeValue = (attribute, value) => {
                // Graduate year: can only input 4 digits
                if (attribute.key === "graduate_year") {
                    return /^\d{0,4}$/.test(value);
                }

                return true;
            };

            // Update values to be updated through axios
            const updateAttributeValue = (v) => {
                if (v === undefined) {
                    return;
                }

                if (isValidAttributeValue(attribute, v)) {
                    if (section_key === "basic") {
                        setUpdate({ ...update, [attribute.key]: v });
                    } else {
                        setUpdate({ ...update, [section_key]: { ...update[section_key], [attribute.key]: v } });
                    }
                }
            };

            if (attribute.type === "file") {
                return <></>;
            } else if (attribute.type === "text") {
                return (
                    <>
                        <label htmlFor={attribute.key} className="block text-sm font-medium text-gray-700 sr-only">
                            {attribute.title}
                        </label>
                        <div className="mt-1">
                            <input
                                type={attribute.type}
                                name={attribute.key}
                                id={attribute.key}
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder={attribute.placeholder}
                                value={section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]}
                                onChange={(e) => updateAttributeValue(e.target.value)}
                                maxLength={attribute.max_length}
                            />
                        </div>
                    </>
                );
            } else if (attribute.type === "textarea") {
                return (
                    <>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 sr-only">
                            {attribute.title}
                        </label>
                        <div className="mt-1">
                            <textarea
                                rows={4}
                                name="comment"
                                id="comment"
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]}
                                onChange={(e) => updateAttributeValue(e.target.value)}
                            />
                        </div>
                    </>
                );
            } else if (attribute.type === "dropdown") {
                return (
                    <>
                        <label htmlFor="dropdown" className="block text-sm font-medium text-gray-700 sr-only">
                            {attribute.title}
                        </label>

                        <Listbox
                            as="div"
                            value={(section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]) || (attribute.placeholder)}
                            onChange={(value) => {
                                updateAttributeValue(value);
                            }}
                        >
                            {({ open }) => (
                                <>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                                            <span className="w-full inline-flex truncate">
                                                <span className="">{option_value_to_title(attribute.options, section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]) || option_value_to_title(attribute.options, attribute.placeholder) || <div className="text-gray-500">{attribute.title}</div>}</span>
                                                <span className="ml-2 truncate text-gray-500">{option_value_to_description(attribute.options, section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]) || option_value_to_description(attribute.options, attribute.placeholder)}</span>
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>

                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                                                key={`${attribute.key}-options`}
                                            >
                                                {attribute.options.map((option, index) => (
                                                    <Listbox.Option
                                                        key={option.value + "_option"}
                                                        className={({ active }) => classNames(
                                                            active ? "text-white bg-emerald-600" : "text-gray-900",
                                                            "cursor-default select-none relative py-2 pl-8 pr-4"
                                                        )
                                                        }
                                                        value={option.value}
                                                    >
                                                        {({ selected, active }) => (
                                                            <>
                                                                <div className="flex">
                                                                    <span className={classNames(selected ? "font-semibold" : "font-normal")}>
                                                                        {option.title}
                                                                    </span>
                                                                    <span className={classNames(active ? "text-emerald-200" : "text-gray-500", "ml-2 truncate")}>
                                                                        {option.description}
                                                                    </span>
                                                                </div>

                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? "text-white" : "text-emerald-600",
                                                                            "absolute inset-y-0 left-0 flex items-center pl-1.5"
                                                                        )}
                                                                    >
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>
                    </>
                );
            } else if (attribute.type === "visibility") {
                // Visibility is a special type of dropdown
                // Define it's behavior and render it using dropdown
                let value_copy = {};
                Object.assign(value_copy, attribute);
                value_copy.type = "dropdown";
                value_copy.options = visibility_options;
                value_copy.placeholder = value_copy.placeholder ? value_copy.placeholder : "self";
                value_copy.title = value_copy.title ? value_copy.title : "Visibility";
                value_copy.description = value_copy.description ? value_copy.description : "Who can see this?";
                return getAttributeDom(value_copy);
            } else if (attribute.type === "markdown-editor") {
                return (
                    <>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 sr-only">
                            {attribute.title}
                        </label>
                        <div className="md:hidden">
                            <label htmlFor="tabs" className="sr-only">
                                Select a tab
                            </label>
                            <select
                                id="tabs"
                                name="tabs"
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                                value={markdownEditorTab}
                                onChange={(e) => setMarkdownEditorTab(e.target.value)}
                            >
                                <option key="edit" value={"edit"}>Edit</option>
                                <option key="preview" value={"preview"}>Preview</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2 h-full grid-rows-1" style={{ height: "65vh" }}>
                            <div className={classNames("col-span-2 md:col-span-1", markdownEditorTab === "edit" ? "" : "hidden md:block")}>
                                <textarea
                                    rows={4}
                                    name="comment"
                                    id="comment"
                                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md h-full resize-none"
                                    value={section_key === "basic" ? (update[attribute.key] || "") : (update[section_key][attribute.key] || "")}
                                    onChange={(e) => updateAttributeValue(e.target.value)}
                                />
                            </div>
                            <div className={classNames("col-span-2 sm:col-span-1 overflow-auto shadow-sm px-4 py-2 rounded-md border-gray-300 border", markdownEditorTab === "preview" ? "" : "hidden md:block")}>
                                <Markdown>
                                    {section_key === "basic" ? update[attribute.key] : update[section_key][attribute.key]}
                                </Markdown>
                            </div>
                            <a className="col-span-2 md:col-span-1 flex text-xs space-x-1 items-center text-gray-500 fill-gray-500 hover:text-gray-800 hover:fill-gray-800" href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" target="_blank" rel="noreferrer">
                                <MarkdownIcon />
                                <p>Styling with Markdown is supported</p>
                            </a>
                        </div>
                    </>
                );
            }
        };

        // If this whole field requires certain role to update and the account role does not match, return nothing for DOM
        if (field.role && field.role !== account.role) {
            return;
        }

        // If this field has only one attribute, make it an array of one
        if (!Array.isArray(field.attributes)) {
            field.attributes = [field.attributes];
        }

        return (
            <>
                <legend className="block text-sm font-medium text-gray-700">{field.title}</legend>
                {
                    field.attribute.map((attribute, index) => (
                        (attribute.role ? attribute.role === account.role : true) ? getAttributeDom(attribute) : null
                    ))
                }
                <Button
                    className="text-sm"
                    loading={loading}
                    disabled={loading || !complete}
                    onClick={() => onSubmit()}
                >
                    Save
                </Button>
            </>
        );
    };

    // For button "Set" or "Update", press and trigger this function
    const onOpenFieldModal = (section_key, field) => {
        let update = {};

        if (!Array.isArray(field.attribute)) {
            field.attribute = [field.attribute];
        }

        // Copy all related field attribute value to update dictionary
        for (const a of field.attribute) {
            if (section_key === "basic") update[a.key] = account[a.key];
            else {
                if (!update[section_key]) update[section_key] = {};
                update[section_key][a.key] = account[section_key][a.key];
            }
        }

        setUpdate(update); // Set update dictionary
        setSectionKey(section_key); // Set current section key for current field
        setField(field); // Set current field for modal to update
        setOpen(true); // Open the modal
    };

    const onSubmit = () => {
        setLoading(true);

        axios.put("/accounts/me", update, { headers: { "x-fields": x_fields } })
            .then(res => {
                console.log(res);
                setAccount(res.data);
                setOpen(false);
            })
            .catch(err => toast.error(err.response.data.message))
            .finally(() => {
                setLoading(false);
            });
    };

    const makeField = (section_key, field_key, field) => {
        if (field.role === undefined || (account != null && "role" in account && field.role === account.role)) {
            // If account is not ready because axios is requesting, show animated data-placeholder
            if (account === null) {
                return (
                    <div key={field_key} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4" >
                        <dt data-placeholder className="w-1/2 h-5 rounded-md" ></dt>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <span data-placeholder className="flex-grow h-5 rounded-md"></span>
                            <span data-placeholder className="ml-4 -shrink-0 flex item-start space-x-4 w-1/3 h-5 rounded-md"></span>
                        </dd>
                    </div>
                );
            }

            return (
                <div key={field_key} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4" >
                    <dt className="text-sm font-medium text-gray-500">
                        {field.title}
                    </dt>
                    <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="flex-grow">
                            {getFieldDisplayValue(section_key, field)}
                        </span>
                        <span className="ml-4 flex-shrink-0 flex item-start space-x-4">
                            {getFieldModalButton(section_key, field)}
                        </span>
                    </dd>
                </div>
            );
        }
    };

    return (
        <>
            {
                Object.entries(profile).map(([section_key, section]) => (
                    <div key={section_key} className="mt-10 divide-y divide-gray-200">
                        {/* Title and description */}
                        <div className="space-y-1">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{section.title}</h3>
                            <p className="max-w-2xl text-sm text-gray-500">{section.description}</p>
                        </div>
                        <div className="mt-6">
                            <dl className="divide-y divide-gray-200">
                                {
                                    Object.entries(section.fields).map(([field_key, field]) => (
                                        makeField(section_key, field_key, field)
                                    ))
                                }
                            </dl>
                        </div>
                    </div>
                ))
            }

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="fixed z-50 inset-0 overflow-none" onClose={() => { if (!loading) setOpen(false); }}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div
                                className={
                                    classNames("w-full inline-block align-bottom bg-white rounded-lg p-4 text-left shadow-xl",
                                        "transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 space-y-4",
                                        field && field.className ? field.className : ""
                                    )
                                }
                            >
                                {getFieldModal(field)}
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    );
};

export default Profile;
