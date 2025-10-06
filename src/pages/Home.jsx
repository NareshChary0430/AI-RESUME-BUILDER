import jsPDF from "jspdf";
import html2canvas from "html2canvas";

    // PDF generation handler (improved for multi-page and better formatting)
    const handleDownloadPDF = async () => {
        const responseSection = document.getElementById("resume-pdf-section");
        if (!responseSection) return;
        try {
            // Try jsPDF html method (best for styled HTML)
            const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
            await pdf.html(responseSection, {
                margin: [20, 20, 20, 20],
                autoPaging: 'text',
                html2canvas: { scale: 2, backgroundColor: '#fff' },
                callback: function (doc) {
                    doc.save("AI_Resume.pdf");
                }
            });
        } catch (err) {
            // Fallback: use html2canvas as image (less pretty, but always works)
            try {
                const canvas = await html2canvas(responseSection, { scale: 2, backgroundColor: '#fff' });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth - 40;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let y = 20;
                let remainingHeight = imgHeight;
                let position = 20;
                // Add image, split into pages if needed
                while (remainingHeight > 0) {
                    pdf.addImage(imgData, "PNG", 20, position, imgWidth, Math.min(remainingHeight, pdf.internal.pageSize.getHeight() - 40));
                    remainingHeight -= (pdf.internal.pageSize.getHeight() - 40);
                    if (remainingHeight > 0) {
                        pdf.addPage();
                        position = 20;
                    }
                }
                pdf.save("AI_Resume.pdf");
            } catch (e) {
                alert("Failed to generate PDF. Please try a different browser or check your content.");
            }
        }
    };

import React, { useState } from "react";
import "../App.css";

function HomePage() {
    const [formData, setFormData] = useState({
        companyName: "",
        applyingAsA: "Experienced",
        coverLetterTone: "Formal",
        jobDescription: "",
        currentResume: ""
    });
    const [geminiResponse, setGeminiResponse] = useState("");

    // Function to parse and display the structured response
    const parseAndDisplayResponse = (response) => {
        if (!response) return null;
        // Split the response into sections
        const sections = response.split(/(?=\d+\.\s\*\*)|(?=##\s)|(?=\*\*\d+\.)/);
        return (
            <div className="response-sections">
                {sections.map((section, index) => {
                    if (!section.trim()) return null;
                    // Check if it's a main section (numbered)
                    const isMainSection = /^\d+\.\s\*\*/.test(section.trim()) || /^\*\*\d+\./.test(section.trim());
                    if (isMainSection) {
                        // Extract title and content
                        const lines = section.trim().split('\n');
                        const titleLine = lines[0];
                        const content = lines.slice(1).join('\n').trim();
                        // Extract clean title
                        const title = titleLine.replace(/^\d+\.\s\*\*/, '').replace(/\*\*$/, '').replace(/^\*\*\d+\./, '').trim();
                        return (
                            <div key={index} className="response-section">
                                <h3 className="section-title">{title}</h3>
                                <div className="section-content">
                                    {formatContent(content)}
                                </div>
                            </div>
                        );
                    } else {
                        // Handle any remaining content
                        return (
                            <div key={index} className="response-section">
                                <div className="section-content">
                                    {formatContent(section.trim())}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        );
    };

    // Function to format content within sections
    const formatContent = (content) => {
        if (!content) return null;
        return content.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return <br key={index} />;
            // Handle bullet points
            if (trimmedLine.startsWith('- ')) {
                return (
                    <div key={index} className="bullet-point">
                        • {trimmedLine.substring(2)}
                    </div>
                );
            }
            // Handle bold text
            if (trimmedLine.includes('**')) {
                const parts = trimmedLine.split('**');
                return (
                    <p key={index}>
                        {parts.map((part, partIndex) =>
                            partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                        )}
                    </p>
                );
            }
            // Handle sub-headers or emphasized lines
            if (trimmedLine.endsWith(':')) {
                return <h4 key={index} className="sub-header">{trimmedLine}</h4>;
            }
            // Regular paragraph
            return <p key={index}>{trimmedLine}</p>;
        });
    };

    async function handleGenerateData() {
        setGeminiResponse('Generating response, please wait...');
        const prompt = `
        You are a professional career coach and resume optimization expert. 
Your task is to generate a personalized cover letter, improve the resume content, 
and provide an ATS (Applicant Tracking System) analysis.

Inputs:
- Company Name: ${formData.companyName}
- Experience Level: ${formData.applyingAsA}  (Fresher / Experienced)
- Job Description: ${formData.jobDescription}
- Current Resume: ${formData.currentResume} (If empty, assume no resume exists and create a draft)
- Preferred Tone: ${formData.coverLetterTone}

Output (format clearly in sections):

1. **Tailored Cover Letter**  
   - Write a professional cover letter addressed to ${formData.companyName}.  
   - Use the specified tone: ${formData.coverLetterTone}.  
   - Highlight relevant skills and experiences based on the job description.  

2. **Updated Resume Content**  
   - Suggest optimized resume summary, bullet points, and skills tailored to ${formData.jobDescription}.  
   - Ensure the content is concise, achievement-focused, and ATS-friendly.  

3. **Keyword Match Analysis**  
   - Extract the most important keywords from the job description.  
   - Check if they exist in the provided resume (if given).  
   - List missing keywords that should be added.  

4. **ATS Score Estimate (0–100)**  
   - Provide a rough ATS match score for the current resume against the job description.  
   - Explain the reasoning briefly (e.g., missing keywords, formatting issues, irrelevant content).  

Ensure the response is structured, clear, and easy to display in a React app. 
        `;
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-goog-api-key': 'youAPIkey'
            },
            body: `{"contents":[{"parts":[{"text":"${prompt}"}]}]}`
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                setGeminiResponse(data.candidates[0].content.parts[0].text);
            } else {
                setGeminiResponse('No response received. Please try again.');
            }
        } catch (error) {
            setGeminiResponse('Error fetching response. Please try again.');
            console.error(error);
        }
    }

    return (
        <div className="container-fluid min-vh-100 bg-gradient-primary-to-secondary d-flex flex-column justify-content-between p-0" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'}}>
            {/* Header Section */}
            <header className="py-5 mb-4 shadow-sm" style={{background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)'}}>
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-12 col-md-10 col-lg-8">
                            <h1 className="display-4 fw-bold mb-2 text-white" style={{letterSpacing: '-1px'}}>AI Resume Builder</h1>
                            <h4 className="mb-2 text-white-50">By Naresh Chary</h4>
                            <p className="lead mb-0 text-white-50">Create professional cover letters and optimize your resume with AI-powered insights</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="row w-100 justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        {/* Form Card */}
                        <div className="card shadow-lg border-0 mb-5 animate__animated animate__fadeInUp" style={{borderRadius: '1.5rem'}}>
                            <div className="card-header bg-white py-4" style={{borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem'}}>
                                <h3 className="card-title text-center mb-0 text-primary">
                                    <i className="bi bi-file-earmark-person me-2"></i>
                                    Resume & Cover Letter Generator
                                </h3>
                            </div>
                            <div className="card-body p-4 bg-light" style={{borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem'}}>
                                <form>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="companyName" className="form-label fw-semibold">
                                                <i className="bi bi-building me-2 text-primary"></i>
                                                Company Name
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg rounded-pill shadow-sm" 
                                                id="companyName"
                                                placeholder="Enter company name"
                                                value={formData.companyName} 
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            />
                                            <div className="form-text">Company you are applying to</div>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="applyingAsA" className="form-label fw-semibold">
                                                <i className="bi bi-person-badge me-2 text-primary"></i>
                                                Experience Level
                                            </label>
                                            <select 
                                                className="form-select form-select-lg rounded-pill shadow-sm" 
                                                id="applyingAsA"
                                                value={formData.applyingAsA} 
                                                onChange={(e) => setFormData({ ...formData, applyingAsA: e.target.value })}
                                            >
                                                <option value="Fresher">Fresher</option>
                                                <option value="Experienced">Experienced</option>
                                            </select>
                                            <div className="form-text">Are you applying as a fresher or experienced person</div>
                                        </div>
                                    </div>

                                    <div className="mb-4 mt-3">
                                        <label htmlFor="coverLetterTone" className="form-label fw-semibold">
                                            <i className="bi bi-chat-square-text me-2 text-primary"></i>
                                            Cover Letter Tone
                                        </label>
                                        <select 
                                            className="form-select form-select-lg rounded-pill shadow-sm" 
                                            id="coverLetterTone"
                                            value={formData.coverLetterTone} 
                                            onChange={(e) => setFormData({ ...formData, coverLetterTone: e.target.value })}
                                        >
                                            <option value="Formal">Formal</option>
                                            <option value="Informal">Informal</option>
                                            <option value="Casual">Casual</option>
                                        </select>
                                        <div className="form-text">Select the tone of your cover letter</div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold" htmlFor="jobDescription">
                                            <i className="bi bi-file-text me-2 text-primary"></i>
                                            Job Description
                                        </label>
                                        <textarea 
                                            name="jobDescription" 
                                            id="jobDescription" 
                                            className="form-control shadow-sm rounded-4" 
                                            rows="5"
                                            placeholder="Paste the job description here..."
                                            value={formData.jobDescription} 
                                            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                        ></textarea>
                                        <div className="form-text">Paste the complete job description for better matching</div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold" htmlFor="currentResume">
                                            <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                                            Current Resume (Optional)
                                        </label>
                                        <textarea 
                                            name="currentResume" 
                                            id="currentResume" 
                                            className="form-control shadow-sm rounded-4" 
                                            rows="7"
                                            placeholder="Paste your current resume content here (optional)..."
                                            value={formData.currentResume} 
                                            onChange={(e) => setFormData({ ...formData, currentResume: e.target.value })}
                                        ></textarea>
                                        <div className="form-text">Paste your current resume to get optimization suggestions</div>
                                    </div>

                                    <div className="d-grid mt-3">
                                        <button 
                                            type="button" 
                                            className="btn btn-gradient-primary btn-lg py-3 rounded-pill shadow-sm fw-bold" 
                                            style={{background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', border: 'none'}} 
                                            onClick={handleGenerateData}
                                        >
                                            <i className="bi bi-magic me-2"></i>
                                            Generate AI-Powered Resume & Cover Letter
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Response Section */}
                        <div className="response-container mb-5">
                            {geminiResponse && (
                                <>
                                <div className="d-flex justify-content-end mb-2">
                                    <button className="btn btn-outline-primary btn-sm fw-bold rounded-pill shadow-sm" onClick={handleDownloadPDF}>
                                        <i className="bi bi-download me-1"></i> Download Resume as PDF
                                    </button>
                                </div>
                                <div id="resume-pdf-section" className="card shadow-lg border-0 animate__animated animate__fadeIn" style={{borderRadius: '1.25rem', overflow: 'hidden'}}>
                                    <div className="card-header bg-success text-white py-3" style={{borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem'}}>
                                        <h3 className="card-title mb-0">
                                            <i className="bi bi-check-circle me-2"></i>
                                            AI Generated Results
                                        </h3>
                                    </div>
                                    <div className="card-body p-4 bg-white" style={{borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem'}}>
                                        <div className="gemini-response">
                                            {parseAndDisplayResponse(geminiResponse)}
                                        </div>
                                    </div>
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="text-center py-3 mt-auto bg-white shadow-sm border-top small text-muted" style={{letterSpacing: '0.5px'}}>
                &copy; {new Date().getFullYear()} AI Resume Builder. All rights reserved.
            </footer>
        </div>
    );
}

export default HomePage;
