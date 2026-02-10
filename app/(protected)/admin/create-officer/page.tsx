"use client";

// Import the CreateOfficerForm component you created in the previous step
// Assuming you saved that big form component as CreateOfficerForm.tsx in components/admin/
import CreateOfficerForm from "@/components/admin/CreateOfficerForm";

export default function CreateOfficerPage() {
    return (
        <div className="p-6 md:p-8 h-full">
            {/* We don't need a header here because the Form component itself 
          has the beautiful Split-Screen header design */}

            <CreateOfficerForm />
        </div>
    );
}