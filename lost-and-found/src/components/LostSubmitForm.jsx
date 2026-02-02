import {useForm} from "react-hook-form";

function LostSubmitForm() {
    const {register, handleSubmit, formState: {errors}} = useForm();  
    
    const onSubmit = (data) => {
        console.log(data);
        /* Send to database */
    };

    return (
        <form className="lost-submit-form" onSubmit={handleSubmit(onSubmit)}>
            <input placeholder ="Item Title" {...register("title", {required: true})} />
            {errors.title && <span className="error">A title is required.</span>}
            <input placeholder ="Description" {...register("description")} />
            <input placeholder = "Current Location" {...register("currentLocation")} />
            <input type="date" {...register("dateLost")} />
            <input placeholder ="Location Lost" {...register("locationLost")} />
            <input type="file" {...register("image", {required: true})} />
            {errors.image && <span className="error">An image is required.</span>}
            <input placeholder ="Contact Info" {...register("contactInfo", {required: true})} />
            {errors.contactInfo && <span className="error">Contact information is required.</span>}
            <button type="submit">Submit</button>
        </form>

    );

}

export default LostSubmitForm;



    
