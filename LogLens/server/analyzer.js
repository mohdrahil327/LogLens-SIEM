const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Phase 2: Load External Signatures from JSON
const signaturesPath = path.join(__dirname, 'signatures.json');
const signatures = JSON.parse(fs.readFileSync(signaturesPath, 'utf8'));

/**
 * Phase 1: Performance-Optimized Streaming Parser
 * Processes files line-by-line to handle 500MB+ logs without RAM crashes.
 */
async function processLogFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ 
        input: fileStream, 
        crlfDelay: Infinity 
    });

    let stats = {
        totalLines: 0,
        attacksFound: 0,
        // Phase 2: Scoring & Tagging
        breakdown: { SQLI: 0, XSS: 0, TRAV: 0, SHELL: 0, BRUTE: 0 },
        severity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0 },
        topAttackers: {},
        failedLogins: {} // For Brute Force detection
    };

    for await (const line of rl) {
        if (!line.trim()) continue;
        stats.totalLines++;

        // Extract IP (Common Log Format)
        const ip = line.match(/^(\S+)/)?.[1] || "Unknown";
        // Extract Status Code
        const statusMatch = line.match(/\s(\d{3})\s/);
        const statusCode = statusMatch ? statusMatch[1] : null;

        let detectedInLine = false;

        // Pattern Matching against Signature Database
        for (const [key, data] of Object.entries(signatures)) {
            const regex = new RegExp(data.pattern, 'i');
            if (regex.test(line)) {
                stats.attacksFound++;
                stats.breakdown[key]++;
                stats.severity[data.severity]++;
                stats.topAttackers[ip] = (stats.topAttackers[ip] || 0) + 1;
                detectedInLine = true;
            }
        }

        // Phase 2: Brute Force Logic (5+ failed logins)
        if (statusCode === "401") {
            stats.failedLogins[ip] = (stats.failedLogins[ip] || 0) + 1;
            if (stats.failedLogins[ip] >= 5 && !detectedInLine) {
                stats.attacksFound++;
                stats.breakdown.BRUTE++;
                stats.severity.MEDIUM++;
                stats.topAttackers[ip] = (stats.topAttackers[ip] || 0) + 1;
            }
        }
    }

    // Phase 3: Geo-IP Simulation for Visualization
    const LOCATIONS = ["USA 🇺🇸", "Russia 🇷🇺", "China 🇨🇳", "Germany 🇩🇪", "India 🇮🇳", "UK 🇬🇧"];
    stats.topAttackers = Object.entries(stats.topAttackers)
        .map(([ip, count], i) => ({
            ip, 
            count, 
            location: LOCATIONS[i % LOCATIONS.length],
            risk: count > 5 ? "CRITICAL" : "HIGH"
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return stats;
}

module.exports = { processLogFile };