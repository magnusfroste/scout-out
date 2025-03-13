-- This script adds proper foreign key constraints with ON DELETE CASCADE
-- to ensure that when a company_search is deleted, all related records are also deleted

-- First, check if the company_question_answers table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'company_question_answers'
  ) THEN
    -- Drop existing foreign key if it exists
    IF EXISTS (
      SELECT FROM information_schema.table_constraints
      WHERE constraint_name = 'company_question_answers_company_search_id_fkey'
      AND table_name = 'company_question_answers'
    ) THEN
      ALTER TABLE public.company_question_answers DROP CONSTRAINT IF EXISTS company_question_answers_company_search_id_fkey;
    END IF;

    -- Add foreign key with ON DELETE CASCADE
    ALTER TABLE public.company_question_answers
    ADD CONSTRAINT company_question_answers_company_search_id_fkey
    FOREIGN KEY (company_search_id)
    REFERENCES public.company_searches(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added ON DELETE CASCADE to company_question_answers foreign key';
  ELSE
    RAISE NOTICE 'Table company_question_answers does not exist';
  END IF;
END
$$;

-- Check if there are any orphaned records in company_question_answers
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM public.company_question_answers cqa
  LEFT JOIN public.company_searches cs ON cqa.company_search_id = cs.id
  WHERE cs.id IS NULL;
  
  IF orphaned_count > 0 THEN
    RAISE NOTICE 'Found % orphaned records in company_question_answers. Cleaning up...', orphaned_count;
    
    -- Delete orphaned records
    DELETE FROM public.company_question_answers
    WHERE company_search_id NOT IN (SELECT id FROM public.company_searches);
    
    RAISE NOTICE 'Cleaned up orphaned records';
  ELSE
    RAISE NOTICE 'No orphaned records found in company_question_answers';
  END IF;
END
$$;

-- Verify the constraint was added correctly
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.table_constraints
    WHERE constraint_name = 'company_question_answers_company_search_id_fkey'
    AND table_name = 'company_question_answers'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    RAISE NOTICE 'Foreign key constraint with CASCADE DELETE successfully added';
  ELSE
    RAISE NOTICE 'Failed to add foreign key constraint';
  END IF;
END
$$;
