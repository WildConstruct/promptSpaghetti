/**
 * Epic 9.2.4 - Comment Form Component
 * Form for creating and editing comments
 */
import React from 'react';

}
}
interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
    initialValue?: string;
    placeholder?: string;
    submitText?: string;
    userId: string;
    compact?: boolean;
    autoFocus?: boolean;

export declare const CommentForm: React.FC<CommentFormProps>;
export default CommentForm;
//# sourceMappingURL=CommentForm.d.ts.map
}
}