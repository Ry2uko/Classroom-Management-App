import { useEffect, useState } from 'react';
import './Modal.css';

const Modal = ({ isModalOpen, isModalAnimating, closeModal, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            setIsVisible(true);
        } else {
           setIsVisible(false); 
        }
    }, [isModalOpen]);

    const handleOverlayClick = (event) => {
        if ((event.target.classList.contains('overlay') || event.target.classList.contains('modal-container')) && isModalOpen) {
            closeModal();
        }
    }

    return isVisible ? (
        <div className={`modal-overlay ${isModalAnimating ? 'in' : 'out'}`} onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="Modal" onClick={(e) => e.stopPropagation()}>
                    { children }
                </div>
            </div>
        </div>
    ) : null;
};

export default Modal;