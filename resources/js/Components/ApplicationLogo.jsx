export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="/images/logo.png" 
            alt="Logo Bendahara" 
            className={`object-contain ${props.className}`} 
        />
    );
}