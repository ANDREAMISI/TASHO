export default function ApplicationLogo({
    className = '',
    alt = 'TASHO',
    ...props
}) {
    return (
        <img
            src="/Images/logo.png"
            alt={alt}
            className={className}
            {...props}
        />
    );
}
