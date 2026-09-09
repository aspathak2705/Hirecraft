/**
 * resumeSections.js
 * Deterministic parser for detecting common resume structural sections.
 */

const SECTION_PATTERNS = [
  { type: 'summary', keywords: ['summary', 'professional summary', 'executive summary', 'profile', 'about me', 'overview'] },
  { type: 'experience', keywords: ['experience', 'work experience', 'employment history', 'professional experience', 'career history', 'work history'] },
  { type: 'projects', keywords: ['projects', 'key projects', 'technical projects', 'personal projects', 'featured work'] },
  { type: 'skills', keywords: ['skills', 'technical skills', 'core competencies', 'skills & tools', 'technologies', 'domain expertise'] },
  { type: 'education', keywords: ['education', 'academic background', 'academic history', 'qualifications'] },
  { type: 'certifications', keywords: ['certifications', 'licenses', 'certificates', 'courses'] },
  { type: 'achievements', keywords: ['achievements', 'awards', 'honors', 'accomplishments', 'key highlights'] },
  { type: 'leadership', keywords: ['leadership', 'volunteering', 'community', 'extra-curricular'] }
];

/**
 * Detects and extracts sections from normalized resume text.
 * @param {string} normalizedText 
 * @returns {Array<object>} Array of detected sections { section_type, section_title, content, start_offset, end_offset }
 */
export function detectResumeSections(normalizedText) {
  if (!normalizedText) return [];

  const lines = normalizedText.split('\n');
  const sections = [];
  let currentSection = { section_type: 'summary', section_title: 'Overview', contentLines: [], start_offset: 0 };
  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase().replace(/[^a-z0-9 ]/g, '');

    // Check if line looks like a section header (short line matching keywords)
    if (line.length > 2 && line.length < 40 && !line.startsWith('-') && !line.includes(':')) {
      let matchedPattern = null;
      for (const pattern of SECTION_PATTERNS) {
        if (pattern.keywords.some(kw => lineLower === kw || lineLower === `my ${kw}` || lineLower === `${kw} & abilities`)) {
          matchedPattern = pattern;
          break;
        }
      }

      if (matchedPattern) {
        // Save previous section if it has content
        if (currentSection.contentLines.length > 0) {
          const content = currentSection.contentLines.join('\n').trim();
          if (content) {
            sections.push({
              section_type: currentSection.section_type,
              section_title: currentSection.section_title,
              content,
              start_offset: currentSection.start_offset,
              end_offset: currentOffset
            });
          }
        }

        // Start new section
        currentSection = {
          section_type: matchedPattern.type,
          section_title: line,
          contentLines: [],
          start_offset: currentOffset
        };
        currentOffset += line.length + 1;
        continue;
      }
    }

    currentSection.contentLines.push(lines[i]);
    currentOffset += lines[i].length + 1;
  }

  // Push final section
  if (currentSection.contentLines.length > 0) {
    const content = currentSection.contentLines.join('\n').trim();
    if (content) {
      sections.push({
        section_type: currentSection.section_type,
        section_title: currentSection.section_title,
        content,
        start_offset: currentSection.start_offset,
        end_offset: currentOffset
      });
    }
  }

  return sections;
}
