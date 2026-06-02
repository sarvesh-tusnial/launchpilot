#!/bin/bash
cd ~/Documents/decathlon

CODES="'D01','D02','D03','D04','D05','D06','D07','D08','D09','D10','D11','D12','D13','D14','D15'"

# Fix all edit pages that have the two-batch pattern
for file in \
  "app/admin/tasks/[id]/edit/page.tsx" \
  "app/admin/content/[id]/edit/page.tsx" \
  "app/admin/mentors/[id]/edit/page.tsx" \
  "app/admin/mentors/[id]/knowledge/new/page.tsx" \
  "app/admin/mentors/[id]/knowledge/[knowledgeId]/edit/page.tsx"
do
  if [ -f "$file" ]; then
    perl -i -0pe "s/const \[batch1, batch2\] = await Promise\.all\(\[.*?\]\)\s*\n\s*const allConcepts = \[\.\.\.(batch1\.data \|\| \[\]), \.\.\.(batch2\.data \|\| \[\])\]/const { data: allConcepts } = await supabase\n    .from('concepts')\n    .select('id, title, sequence, competency_code')\n    .in('competency_code', DECATHLON_CODES)\n    .order('competency_code').order('sequence')/gs" "$file"
    
    # Add DECATHLON_CODES const if not present
    if ! grep -q "DECATHLON_CODES" "$file"; then
      sed -i '' "s/const ALL_COMPETENCIES = CLIENT.competencies/const ALL_COMPETENCIES = CLIENT.competencies\nconst DECATHLON_CODES = CLIENT.competencies.map(c => c.code)/" "$file"
    fi
    echo "✓ Fixed $file"
  else
    echo "✗ Not found: $file"
  fi
done
