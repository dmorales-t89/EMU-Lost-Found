import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabaseClient";

function LostSubmitForm() {
    const {register, handleSubmit, formState: {errors}, reset} = useForm();  
    
    const onSubmit = async (data) => {
        try {
            let imageUrl = null;
            if (data.image && data.image[0]) {
                const file = data.image[0];
                const fileName = `${Date.now()}_${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lost-found-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data:urlData } = supabase.storage
                    .from('lost-found-images')
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
            
            const { error: insertError } = await supabase.from('items').insert([
                {
                    type: data.itemType,
                    title: data.title,
                    description: data.description || null,
                    image_url: imageUrl,
                    contact_info: data.contactInfo,
                    current_location: data.currentLocation || null,
                    date_event: data.dateEvent || null,
                    event_location: data.eventLocation || null
                }
            ]);

            if(insertError) throw insertError;

            alert("Your submission has been received!");
            reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("There was an error submitting your form. Please try again.");
        }
    };

    return (
        <form className="lost-submit-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="itemType">Lost or Found: *</label>
                <select id="itemType" {...register("itemType", { required: "Please select Lost or Found." })}>
                    <option value="">Select an option:</option>
                    <option value="lost">I lost an item.</option>
                    <option value="found">I found an item.</option>
                </select>
                {errors.itemType && <span className="error">{errors.itemType.message}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="title">Item Title: *</label>
                <input type="text" id="title" {...register("title", { required: "Item title is required." })} />
                {errors.title && <span className="error">{errors.title.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea id="description" {...register("description")} />
            </div>

            <div className="form-group">
                <label htmlFor="currentLocation">Current Location:</label>
                <input type="text" id="currentLocation" {...register("currentLocation")} />
            </div>

            <div className="form-group">
                <label htmlFor="dateEvent">Date Lost:</label>
                <input type="date" id="dateEvent" {...register("dateEvent")} />
            </div>

            <div className="form-group">
                <label htmlFor="eventLocation">Location Lost:</label>
                <input type="text" id="eventLocation" {...register("eventLocation")} />
            </div>

            <div className="form-group">
                <label htmlFor="image">Image: *</label>
                <input id="image" type="file" {...register("image", { required: "Image is required." })} />
                {errors.image && <span className="error">{errors.image.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="contactInfo">Email: *</label>
                <input type="text" id="contactInfo" {...register("contactInfo", { required: "Email is required." })} />
                {errors.contactInfo && <span className="error">{errors.contactInfo.message}</span>}
            </div>

            <div className="form-group">
                <button type="submit">Submit</button>
            </div>
        </form>

    );

}

export default LostSubmitForm;



    
