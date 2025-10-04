type Props = {
    small?: boolean;
}

export default function Logo({small = false}: Props) {
    if (small) {
        return (
            <img 
                src="/assets/logo-small.svg" 
                className="h-16"
            />
        )
    }

    return (
        <img 
            src="/assets/logo.svg"
            className="h-16"
        />
    )
}