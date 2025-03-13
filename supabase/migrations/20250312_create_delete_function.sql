-- Create a function to safely delete a search and all related answers in a single transaction
CREATE OR REPLACE FUNCTION delete_search_with_related_data(search_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Start a transaction
    BEGIN
        -- First delete related answers
        DELETE FROM company_question_answers
        WHERE company_search_id = search_id;
        
        -- Then delete the search itself
        DELETE FROM company_searches
        WHERE id = search_id;
        
        -- Commit the transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- If any error occurs, roll back the transaction
        ROLLBACK;
        RAISE EXCEPTION 'Failed to delete search: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
