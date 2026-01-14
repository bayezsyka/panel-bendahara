export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="https://jkk.sangkolo.store/images/logo.png" 
            alt="Logo Bendahara" 
            className={`object-contain ${props.className}`} 
        />
    );
}