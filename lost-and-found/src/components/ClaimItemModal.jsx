import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

function ClaimItemModal({ isOpen, itemTitle, onClose, onSubmit, submitting = false, errorMessage = ''}){
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },

    } = useForm({ defaultValues: { requestorEmail: ''}})

    useEffect(() => {
        if(isOpen) reset ({ requestorEmail: ''});
    }, [isOpen, reset])

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const submit = async (values) => {
        await onSubmit?.(values); // values = { requestorEmail }
    };

    return (
        <div
        className="claim-modal-overlay"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
        }}
        >
            <div className="claim-modal" role="dialog" aria-modal="true" aria-label="Claim item">
                <h2>Claim Item</h2>
                <p>Are you sure you want to claim <strong>{itemTitle}</strong>?</p>

                <form onSubmit={handleSubmit(submit)}>
                    <label htmlFor="requestorEmail">Your email address *</label>
                    <input
                        id="requestorEmail"
                        type="email"
                        autoComplete='email'
                        disabled={submitting}
                        {...register('requestorEmail', {
                            required: 'Email is required.',
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: 'Please enter a valid email address.',
                            },
                        })}
                    />
                    {errors.requestorEmail && <span className="error">{errors.requestorEmail.message}</span>}
                    {errorMessage && <span className="error">{errorMessage}</span>}
                    
                    <div className="claim-modal-actions">
                        <button type="button" className="read-more-btn" onClick={onClose} disabled={submitting}>
                         Cancel
                        </button>
                        <button type="submit" className="claim-btn" disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send claim request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClaimItemModal;
