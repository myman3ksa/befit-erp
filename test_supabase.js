const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta2RlcnpkaXBremdpdGlkbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODMzMTEsImV4cCI6MjA4ODU1OTMxMX0.5lcOpcwG6op3El3Sa0hRecvjFmV2KTdgiJ2XA2-Ebd0';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log("Testing insert into items...");
    const { data: item, error: itemError } = await supabaseClient
        .from('items')
        .insert([{ 
            name: "Test Node Item", 
            unit: "kg", 
            base_cost: 0 
        }])
        .select()
        .single();
    
    if (itemError) {
        console.error("Insertion Error:", itemError);
    } else {
        console.log("Success! Inserted:", item);
    }
}

testInsert();
