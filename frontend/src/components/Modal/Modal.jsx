import { useEffect, useState } from 'react';
import './Modal.css';

const Modal = ({ isModalOpen, closeModal, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10); // reflow
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 225); // wait for animation
        }
    }, [isModalOpen]);

    const handleOverlayClick = (event) => {
        if ((event.target.classList.contains('overlay') || event.target.classList.contains('modal-container')) && isModalOpen) {
            closeModal();
        }
    }
    
    return isVisible ? (
        <div className={`modal-overlay ${isAnimating ? 'in' : 'out'}`} onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="Modal" onClick={(e) => e.stopPropagation()}>
                    { children }
                </div>
            </div>
        </div>
    ) : null;
};

export default Modal;