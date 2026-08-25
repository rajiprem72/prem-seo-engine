/* =========================================================
   PREM SEO ENGINE
   Stage 1 - SEO Auditor
   Frontend JavaScript
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

/*
   Local FastAPI backend during development.

   Example:
   http://127.0.0.1:8000

   When we deploy the backend later, we will change this URL.
*/

const API_BASE_URL = "http://127.0.0.1:8000";


/*
   API endpoint that will perform the SEO audit.
*/
const AUDIT_ENDPOINT = `${API_BASE_URL}/api/audit`;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const auditForm = document.getElementById("auditForm");

const websiteUrlInput =
    document.getElementById("websiteUrl");

const analyseButton =
    document.getElementById("analyseButton");

const auditStatus =
    document.getElementById("auditStatus");

const statusTitle =
    document.getElementById("statusTitle");

const statusMessage =
    document.getElementById("statusMessage");

const resultsSection =
    document.getElementById("resultsSection");

const newAuditButton =
    document.getElementById("newAuditButton");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Prem SEO Engine loaded.");

    /*
       Check whether the browser supports the required
       functionality.
    */

    if (!window.fetch) {
        showError(
            "Your browser does not support the required features."
        );
    }

});


/* =========================================================
   FORM SUBMISSION
========================================================= */

auditForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const websiteUrl =
        websiteUrlInput.value.trim();


    /*
       Validate URL
    */

    if (!websiteUrl) {

        showError(
            "Please enter a website URL."
        );

        websiteUrlInput.focus();

        return;
    }


    if (!isValidUrl(websiteUrl)) {

        showError(
            "Please enter a valid website URL, for example https://example.com"
        );

        websiteUrlInput.focus();

        return;
    }


    /*
       Start audit
    */

    await startAudit(websiteUrl);

});


/* =========================================================
   START AUDIT
========================================================= */

async function startAudit(websiteUrl) {

    /*
       Reset previous results
    */

    resetResults();


    /*
       Disable button
    */

    setLoadingState(true);


    /*
       Show status
    */

    showAuditStatus(
        "Starting SEO audit...",
        "Connecting to the SEO analysis engine."
    );


    try {

        /*
           Send website URL to FastAPI backend.
        */

        const response = await fetch(
            AUDIT_ENDPOINT,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: websiteUrl
                })
            }
        );


        /*
           Check HTTP response.
        */

        if (!response.ok) {

            let errorMessage =
                `Server returned HTTP ${response.status}.`;

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {
                    errorMessage =
                        errorData.detail;
                }

            } catch (error) {

                console.warn(
                    "Unable to read server error.",
                    error
                );

            }

            throw new Error(errorMessage);

        }


        /*
           Read JSON result.
        */

        const result =
            await response.json();


        /*
           Update status.
        */

        showAuditStatus(
            "Audit completed",
            "Preparing your SEO report..."
        );


        /*
           Display results.
        */

        displayResults(
            result
        );


    } catch (error) {

        console.error(
            "SEO audit error:",
            error
        );


        /*
           Display useful error message.
        */

        showError(
            getFriendlyErrorMessage(error)
        );


    } finally {

        /*
           Re-enable button.
        */

        setLoadingState(false);

    }

}


/* =========================================================
   URL VALIDATION
========================================================= */

function isValidUrl(value) {

    try {

        const url =
            new URL(value);

        /*
           Only allow HTTP / HTTPS.
        */

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {

            return false;

        }

        return true;

    } catch (error) {

        return false;

    }

}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoadingState(isLoading) {

    analyseButton.disabled =
        isLoading;


    if (isLoading) {

        analyseButton.textContent =
            "Analysing...";

    } else {

        analyseButton.textContent =
            "Analyse Website";

    }

}


/* =========================================================
   AUDIT STATUS
========================================================= */

function showAuditStatus(
    title,
    message
) {

    auditStatus.classList.remove(
        "hidden"
    );


    statusTitle.textContent =
        title;


    statusMessage.textContent =
        message;

}


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showError(message) {

    auditStatus.classList.remove(
        "hidden"
    );


    statusTitle.textContent =
        "Audit could not be completed";


    statusMessage.textContent =
        message;


    /*
       Change spinner into an error indicator.
    */

    const spinner =
        auditStatus.querySelector(
            ".spinner"
        );


    if (spinner) {

        spinner.style.animation =
            "none";

        spinner.style.border =
            "3px solid #fecaca";

        spinner.style.borderTopColor =
            "#dc2626";

    }

}


/* =========================================================
   FRIENDLY ERROR MESSAGE
========================================================= */

function getFriendlyErrorMessage(error) {

    const message =
        error?.message || "";


    /*
       Backend unavailable
    */

    if (
        message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Unable to connect to the SEO engine. " +
            "Please make sure the FastAPI backend is running."
        );

    }


    /*
       CORS issue
    */

    if (
        message.toLowerCase().includes(
            "cors"
        )
    ) {

        return (
            "The SEO engine connection was blocked by browser security. " +
            "We will configure the backend connection next."
        );

    }


    return message ||
        "An unexpected error occurred. Please try again.";

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(data) {

    /*
       Show results section.
    */

    resultsSection.classList.remove(
        "hidden"
    );


    /*
       Hide audit status after successful
       result display.
    */

    auditStatus.classList.add(
        "hidden"
    );


    /*
       Website
    */

    const website =
        data.website ||
        data.url ||
        websiteUrlInput.value;


    document.getElementById(
        "resultWebsite"
    ).textContent =
        website;


    /*
       Overall score
    */

    setText(
        "overallScore",
        formatScore(
            data.overall_score
        )
    );


    /*
       Score message
    */

    setText(
        "scoreMessage",
        getScoreMessage(
            data.overall_score
        )
    );


    /*
       Category scores
    */

    setText(
        "technicalScore",
        formatScore(
            data.technical_score
        )
    );


    setText(
        "onPageScore",
        formatScore(
            data.on_page_score
        )
    );


    setText(
        "contentScore",
        formatScore(
            data.content_score
        )
    );


    /*
       Summary statistics
    */

    setText(
        "pagesAnalysed",
        formatNumber(
            data.pages_analysed
        )
    );


    setText(
        "criticalIssues",
        formatNumber(
            data.critical_issues
        )
    );


    setText(
        "improvements",
        formatNumber(
            data.improvements
        )
    );


    setText(
        "goodPractices",
        formatNumber(
            data.good_practices
        )
    );


    /*
       Priority recommendations
    */

    renderPriorities(
        data.priorities
    );


    /*
       Page analysis
    */

    renderPageResults(
        data.pages
    );


    /*
       Technical checks
    */

    renderTechnicalChecks(
        data.technical_checks
    );


    /*
       Scroll to results.
    */

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   SAFE TEXT SETTER
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "--";

}


/* =========================================================
   SCORE FORMATTING
========================================================= */

function formatScore(score) {

    if (
        score === undefined ||
        score === null ||
        score === ""
    ) {

        return "--";

    }


    const number =
        Number(score);


    if (Number.isNaN(number)) {

        return "--";

    }


    return Math.round(number);

}


/* =========================================================
   NUMBER FORMATTING
========================================================= */

function formatNumber(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "--";

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return "--";

    }


    return number.toLocaleString();

}


/* =========================================================
   SCORE MESSAGE
========================================================= */

function getScoreMessage(score) {

    if (
        score === undefined ||
        score === null
    ) {

        return "Awaiting analysis";

    }


    const number =
        Number(score);


    if (Number.isNaN(number)) {

        return "Awaiting analysis";

    }


    if (number >= 90) {

        return "Excellent SEO foundation";

    }


    if (number >= 80) {

        return "Very good SEO foundation";

    }


    if (number >= 70) {

        return "Good, with room for improvement";

    }


    if (number >= 60) {

        return "Several improvements recommended";

    }


    if (number >= 40) {

        return "Significant SEO improvements needed";

    }


    return "Major SEO issues need attention";

}


/* =========================================================
   PRIORITY RECOMMENDATIONS
========================================================= */

function renderPriorities(
    priorities
) {

    const container =
        document.getElementById(
            "priorityList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(priorities) ||
        priorities.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div>🎯</div>

                <p>
                    No priority recommendations
                    are available yet.
                </p>

            </div>
        `;

        return;

    }


    priorities.forEach(
        (priority, index) => {

            const title =
                priority.title ||
                priority.issue ||
                "SEO Recommendation";


            const description =
                priority.description ||
                priority.recommendation ||
                "";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "priority-item";


            item.innerHTML = `

                <div class="priority-item-title">

                    <div class="priority-number">
                        ${index + 1}
                    </div>

                    <h4>
                        ${escapeHtml(title)}
                    </h4>

                </div>

                <p>
                    ${escapeHtml(description)}
                </p>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   PAGE RESULTS
========================================================= */

function renderPageResults(
    pages
) {

    const tbody =
        document.getElementById(
            "pageResults"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(pages) ||
        pages.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >
                    No page data available.
                </td>

            </tr>

        `;

        return;

    }


    pages.forEach(
        (page) => {

            const row =
                document.createElement(
                    "tr"
                );


            const titleStatus =
                getCheckStatus(
                    page.title
                );


            const metaStatus =
                getCheckStatus(
                    page.meta_description
                );


            const h1Status =
                getCheckStatus(
                    page.h1
                );


            const imageStatus =
                getImageStatus(
                    page
                );


            const overallStatus =
                page.status ||
                "Analysed";


            row.innerHTML = `

                <td title="${escapeAttribute(page.url || "")}">
                    ${escapeHtml(
                        shortenUrl(
                            page.url || ""
                        )
                    )}
                </td>

                <td class="${titleStatus.className}">
                    ${escapeHtml(
                        titleStatus.text
                    )}
                </td>

                <td class="${metaStatus.className}">
                    ${escapeHtml(
                        metaStatus.text
                    )}
                </td>

                <td class="${h1Status.className}">
                    ${escapeHtml(
                        h1Status.text
                    )}
                </td>

                <td class="${imageStatus.className}">
                    ${escapeHtml(
                        imageStatus.text
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        String(
                            overallStatus
                        )
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   CHECK STATUS
========================================================= */

function getCheckStatus(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return {
            text: "Missing",
            className: "status-critical"
        };

    }


    return {
        text: "Present",
        className: "status-good"
    };

}


/* =========================================================
   IMAGE STATUS
========================================================= */

function getImageStatus(
    page
) {

    const total =
        Number(
            page.image_count || 0
        );


    const missingAlt =
        Number(
            page.images_missing_alt || 0
        );


    if (total === 0) {

        return {
            text: "None",
            className: "status-warning"
        };

    }


    if (missingAlt > 0) {

        return {
            text:
                `${missingAlt} ALT missing`,
            className:
                "status-warning"
        };

    }


    return {
        text: "Good",
        className: "status-good"
    };

}


/* =========================================================
   TECHNICAL CHECKS
========================================================= */

function renderTechnicalChecks(
    checks
) {

    const container =
        document.getElementById(
            "technicalChecks"
        );


    if (!container) {
        return;
    }


    if (!checks) {

        return;

    }


    const checkItems =
        container.querySelectorAll(
            ".check-item"
        );


    checkItems.forEach(
        (item) => {

            const label =
                item.querySelector(
                    "span"
                )?.textContent
                ?.trim()
                ?.toLowerCase();


            const valueElement =
                item.querySelector(
                    "strong"
                );


            if (!valueElement) {
                return;
            }


            let value =
                "--";


            if (
                label.includes(
                    "https"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.https
                    );

            } else if (
                label.includes(
                    "robots"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.robots_txt
                    );

            } else if (
                label.includes(
                    "sitemap"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.sitemap
                    );

            } else if (
                label.includes(
                    "canonical"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.canonical
                    );

            } else if (
                label.includes(
                    "schema"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.schema
                    );

            } else if (
                label.includes(
                    "mobile"
                )
            ) {

                value =
                    formatCheckValue(
                        checks.mobile
                    );

            }


            valueElement.textContent =
                value;

        }
    );

}


/* =========================================================
   TECHNICAL CHECK VALUE
========================================================= */

function formatCheckValue(
    value
) {

    if (
        value === true
    ) {

        return "✓ Good";

    }


    if (
        value === false
    ) {

        return "✕ Issue";

    }


    if (
        value === undefined ||
        value === null
    ) {

        return "--";

    }


    return String(value);

}


/* =========================================================
   SHORTEN URL
========================================================= */

function shortenUrl(
    url,
    maxLength = 65
) {

    if (
        !url ||
        url.length <= maxLength
    ) {

        return url;

    }


    return (
        url.substring(
            0,
            maxLength - 3
        ) + "..."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   RESET RESULTS
========================================================= */

function resetResults() {

    /*
       Hide results.
    */

    resultsSection.classList.add(
        "hidden"
    );


    /*
       Reset audit status.
    */

    auditStatus.classList.add(
        "hidden"
    );


    /*
       Reset spinner appearance.
    */

    const spinner =
        auditStatus.querySelector(
            ".spinner"
        );


    if (spinner) {

        spinner.style.animation =
            "";

        spinner.style.border =
            "";

        spinner.style.borderTopColor =
            "";

    }

}


/* =========================================================
   NEW AUDIT
========================================================= */

newAuditButton.addEventListener(
    "click",
    () => {

        /*
           Clear input.
        */

        websiteUrlInput.value =
            "";


        /*
           Reset results.
        */

        resetResults();


        /*
           Enable button.
        */

        setLoadingState(
            false
        );


        /*
           Scroll back to top.
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
           Focus URL field.
        */

        setTimeout(
            () => {
                websiteUrlInput.focus();
            },
            400
        );

    }
);


/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

websiteUrlInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            auditForm.requestSubmit();

        }

    }
);


/* =========================================================
   NETWORK STATUS
========================================================= */

window.addEventListener(
    "online",
    () => {

        console.log(
            "Internet connection restored."
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        console.warn(
            "Internet connection lost."
        );

    }
);


/* =========================================================
   DEBUG HELPER
========================================================= */

function logAuditResult(
    data
) {

    console.log(
        "Prem SEO Engine Audit Result:",
        data
    );

}
