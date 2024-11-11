interface SVG {
    width: string;
    color?: string;
}

export default function IconClose({ width, color }: SVG) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="black"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            width={width}
        >
            <path
                fill={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
            />
        </svg>
    );
}
