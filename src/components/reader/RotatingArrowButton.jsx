import React from "react";

function RotatingArrowButton({ rotated = false, onClick, title = "Xem bookmark" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="transform transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full focus:outline-none"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`transform transition-transform duration-300 ease-out ${rotated ? "rotate-180" : ""}`}
            >
                <path
                    d="M6 15L12 9L18 15"
                    stroke="#0194f3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

export default RotatingArrowButton;
