import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

function useKeyboardStatus() {
    const [isKeyboardOpen, setKeyboardOpen] = useState(false);

    useEffect(() => {
        // Function to handle keyboard show event
        function keyboardDidShow() {
            setKeyboardOpen(true);
        }

        // Function to handle keyboard hide event
        function keyboardDidHide() {
            setKeyboardOpen(false);
        }

        // Subscribe to keyboard events when the component mounts
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            keyboardDidShow,
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            keyboardDidHide,
        );

        // Clean up by unsubscribing from the events when the component unmounts
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return isKeyboardOpen;
}

export default useKeyboardStatus;
