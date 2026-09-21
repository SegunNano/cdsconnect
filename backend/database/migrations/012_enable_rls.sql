-- Enable Row Level Security on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on all other tables to lock down the Data API
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excuse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;