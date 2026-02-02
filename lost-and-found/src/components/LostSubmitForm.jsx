import {useForm} from "react-hook-form";

function LostSubmitForm() {
    const {register, handleSubmit, formState: {errors}} = useForm();  
    
    const onSubmit = (data) => {
        console.log(data);
        /* Send to database */
    };

    return (
        <form className="lost-submit-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="title">Item Title:</label>
                <input id="title" placeholder="Item Title" {...register("title", { required: "Item title is required." })} />
                {errors.title && <span className="error">{errors.title.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea id="description" placeholder="Description" {...register("description")} />
            </div>

            <div className="form-group">
                <label htmlFor="currentLocation">Current Location:</label>
                <input id="currentLocation" placeholder="Current Location" {...register("currentLocation")} />
            </div>

            <div className="form-group">
                <label htmlFor="dateLost">Date Lost:</label>
                <input type="date" id="dateLost" {...register("dateLost")} />
            </div>

            <div className="form-group">
                <label htmlFor="locationLost">Location Lost:</label>
                <input id="locationLost" placeholder="Location Lost" {...register("locationLost")} />
            </div>

            <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input id="image" type="file" {...register("image", { required: "Image is required." })} />
                {errors.image && <span className="error">{errors.image.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="contactInfo">Contact Info:</label>
                <input id="contactInfo" placeholder="Contact Info" {...register("contactInfo", { required: "Contact information is required." })} />
                {errors.contactInfo && <span className="error">{errors.contactInfo.message}</span>}
            </div>

            <div className="form-group">
                <button type="submit">Submit</button>
            </div>
        </form>

    );

}

export default LostSubmitForm;



    
