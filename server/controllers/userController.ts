import { Request, Response } from 'express'
import prisma from '../lib/prisma.js';
import Stripe from 'stripe'
import openai from '../configs/openai.js';


// Get user credits 
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        return res.json({ credits: user?.credits })
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// Controller function to create a New Project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;
        console.log("Initial" , initial_prompt)
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if(user && user.credits < 5){
            return res.status(403).json({ message: 'add credits to create more projects' });
        }
 
        // Create a new project
        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                initial_prompt,
                userId
            }
        })
         
         // Update User's Total Creation
        await prisma.user.update({
            where: {id: userId},
            data: {totalCreation: {increment: 1}}
        })
        
       // Add the new conversation 
         await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        })

        // Reducing the user credits by 5 
          await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        })
        
         res.json({projectId: project.id})


        // Enhance user prompt 
       const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'openai/gpt-oss-20b:free', // cohere/north-mini-code:free can also be used here
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

                    Enhance this prompt by:
                    1. Adding specific design details (layout, color scheme, typography)
                    2. Specifying key sections and features
                    3. Describing the user experience and interactions
                    4. Including modern web design best practices
                    5. Mentioning responsive design requirements
                    6. Adding any missing but important elements

                    Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
                },
                {
                    role: 'user',
                    content: initial_prompt
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
      console.log("enchanced prompt" , enhancedPrompt) ;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId: project.id
            }
        })

     

          await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'now generating your website...',
                projectId: project.id
            }
        })

//         // Generate website code 

//          const codeGenerationResponse = await openai.chat.completions.create({
//             model: 'cohere/north-mini-code:free',
//             messages: [
//                 {
//                     role: 'system',
//                      content: `
//                      You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

//                     CRITICAL REQUIREMENTS:
//                     - You MUST output valid HTML ONLY. 
//                     - Use Tailwind CSS for ALL styling
//                     - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
//                     - Use Tailwind utility classes extensively for styling, animations, and responsiveness
//                     - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
//                     - Use modern, beautiful design with great UX using Tailwind classes
//                     - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
//                     - Use Tailwind animations and transitions (animate-*, transition-*)
//                     - Include all necessary meta tags
//                     - Use Google Fonts CDN if needed for custom fonts
//                     - Use placeholder images from https://placehold.co/600x400
//                     - Use Tailwind gradient classes for beautiful backgrounds
//                     - Make sure all buttons, cards, and components use Tailwind styling

//                     CRITICAL HARD RULES:
//                     1. You MUST put ALL output ONLY into message.content.
//                     2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
//                     3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
//                     4. Do NOT include markdown, explanations, notes, or code fences.

//                     The HTML should be complete and ready to render as-is with Tailwind CSS.`
//                 },
//                 {
//                     role: 'user',
//                     content: enhancedPrompt || ''
//                 }
//             ]
//         })
// console.log("Generated response" , codeGenerationResponse)

//         const code = codeGenerationResponse.choices[0].message.content || '';
//        console.log("generated code" , code) ;
//         if(!code){
//              await prisma.conversation.create({
//             data: {
//                 role: 'assistant',
//                 content: "Unable to generate the code, please try again",
//                 projectId: project.id
//             }
//         })
//         await prisma.user.update({
//             where: {id: userId},
//             data: {credits: {increment: 5}}
//         })
//         return;
//         }



// 2nd way

const websitePlanResponse = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b:free",
    // temperature: 0.4,
    // max_tokens: 800,
    messages: [
        {
            role: "system",
            content: `
You are an expert UI/UX designer.

Convert the user's request into a concise website specification.

Rules:
- Maximum 250 words.
- Use bullet points.
- Describe only:
    • Theme
    • Color palette
    • Typography
    • Layout
    • Sections
    • Components
    • Interactions
    • Responsive behavior
- Focus only on requirements needed for a single HTML page.
- Do NOT generate HTML.
- Do NOT explain anything.
- Return ONLY the specification.
`
        },
        {
            role: "user",
            content: enhancedPrompt || ""
        }
    ]
});

const websiteSpec = {
    initial_prompt: enhancedPrompt,
    specification:
        websitePlanResponse.choices[0].message.content?.trim() || ""
};

if (!websiteSpec.specification) {
    await prisma.conversation.create({
        data: {
            role: "assistant",
            content: "Unable to generate the website specification. Please try again.",
            projectId: project.id
        }
    });

    await prisma.user.update({
        where: { id: userId },
        data: {
            credits: {
                increment: 5
            }
        }
    });

    return;
}

console.log("Website Specification:", websiteSpec);

const codeGenerationResponse = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b:free",
    // temperature: 0.5,
    // max_tokens: 7000,
    messages: [
        {
            role: "system",
            content: `
You are an expert frontend developer.

Generate a complete production-ready single-page website.

Requirements:

OUTPUT
- Return ONLY valid HTML.
- No markdown.
- No explanations.
- No code fences.

TAILWIND
- Use Tailwind CSS ONLY.
- Include:

<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

HTML
- Return a complete HTML document.
- Include meta tags.
- Use semantic HTML5.
- Use ARIA labels.

DESIGN
- Modern UI.
- Mobile-first.
- Beautiful spacing.
- Responsive.
- Glassmorphism where suitable.
- Tailwind gradients.
- Attractive cards.
- Smooth transitions.
- Google Fonts if needed.

IMAGES
- Use https://placehold.co/600x400

JAVASCRIPT
- Put all JavaScript inside ONE <script> tag before </body>.
- Implement every interaction from the specification.

Return ONLY the HTML document.
`
        },
        {
            role: "user",
            content: `
Initial User Request:
${websiteSpec.initial_prompt}

Website Specification:
${websiteSpec.specification}
`
        }
    ]
});

console.log("Generated Response:", codeGenerationResponse.choices[0].message.content);

const code =
    codeGenerationResponse.choices[0].message.content?.trim() || "";

console.log("Generated Code:", code);

if (!code) {
    await prisma.conversation.create({
        data: {
            role: "assistant",
            content: "Unable to generate the code, please try again.",
            projectId: project.id
        }
    });

    await prisma.user.update({
        where: { id: userId },
        data: {
            credits: {
                increment: 5
            }
        }
    });

    return;
}







// 3rd 


// // STEP 1: Generate Website Plan
// const websitePlanResponse = await openai.chat.completions.create({
//     model: "cohere/north-mini-code:free",
//     temperature: 0.4,
//     max_tokens: 800,
//     messages: [
//         {
//             role: "system",
//             content: `
// You are an expert UI/UX designer.

// Convert the user's request into a concise website specification.

// Rules:
// - Maximum 250 words.
// - Use bullet points.
// - Describe ONLY:
//   • Theme
//   • Color palette
//   • Typography
//   • Layout
//   • Sections
//   • Components
//   • Interactions
//   • Responsive behavior
// - Focus only on requirements needed to generate a single HTML file.
// - Do NOT generate HTML.
// - Do NOT explain your reasoning.
// - Do NOT mention Vite, Webpack, Lighthouse, deployment, SEO scores, testing or implementation details.
// Return ONLY the specification.
// `
//         },
//         {
//             role: "user",
//             content: enhancedPrompt || ""
//         }
//     ]
// });

// const websitePlan =
//     websitePlanResponse.choices[0].message.content?.trim() || "";

// if (!websitePlan) {
//     await prisma.conversation.create({
//         data: {
//             role: "assistant",
//             content: "Unable to generate the website plan. Please try again.",
//             projectId: project.id
//         }
//     });

//     await prisma.user.update({
//         where: { id: userId },
//         data: {
//             credits: {
//                 increment: 5
//             }
//         }
//     });

//     return;
// }

// console.log("Website Plan:\n", websitePlan);

// // STEP 2: Generate HTML
// const codeGenerationResponse = await openai.chat.completions.create({
//     model: "cohere/north-mini-code:free",
//     temperature: 0.5,
//     max_tokens: 7000,
//     messages: [
//         {
//             role: "system",
//             content: `
// You are an expert frontend developer.

// Generate a complete production-ready single-page website.

// Requirements:

// OUTPUT
// - Return ONLY valid HTML.
// - No markdown.
// - No explanations.
// - No comments outside the HTML.
// - No code fences.

// TAILWIND
// - Use Tailwind CSS ONLY.
// - Include this script inside <head>:
// <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

// HTML
// - Return a complete HTML document.
// - Include all required meta tags.
// - Use semantic HTML5.
// - Use ARIA labels where appropriate.

// DESIGN
// - Modern UI.
// - Beautiful spacing.
// - Responsive.
// - Mobile-first.
// - Tailwind gradients.
// - Glassmorphism where appropriate.
// - Smooth transitions.
// - Attractive cards and buttons.
// - Clean typography.
// - Google Fonts if needed.

// IMAGES
// - Use placeholder images from:
// https://placehold.co/600x400

// JAVASCRIPT
// - Put all JavaScript inside ONE <script> tag before </body>.
// - Implement every interaction requested.

// RESPONSIVENESS
// - Use sm:, md:, lg:, xl: breakpoints.
// - Ensure excellent mobile experience.

// Return only the complete HTML document.
// `
//         },
//         {
//             role: "user",
//             content: websitePlan
//         }
//     ]
// });
// console.log("Generated Response:", codeGenerationResponse);
// console.log("Generated Response:", codeGenerationResponse.choices[0]);
// console.log("Generated Response:", codeGenerationResponse.choices[0].message.content);
// console.log("Generated Response:", codeGenerationResponse.choices[0].message);

// const code =
//     codeGenerationResponse.choices[0].message.content?.trim() || "";

// console.log("Generated Code:", code);

// if (!code) {
//     await prisma.conversation.create({
//         data: {
//             role: "assistant",
//             content: "Unable to generate the code, please try again.",
//             projectId: project.id
//         }
//     });

//     await prisma.user.update({
//         where: { id: userId },
//         data: {
//             credits: {
//                 increment: 5
//             }
//         }
//     });

//     return;
// }




















      // Create the version for the project 
   
  const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                description: 'Initial version',
                projectId: project.id
            }
        })

      await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've created your website! You can now preview it and request any changes.",
                projectId: project.id
            }
        })

        await prisma.websiteProject.update({
            where: {id: project.id},
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                current_version_index: version.id
            }
        })



    } catch (error : any) {
     await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 5}}
        })
        console.log(error);
        res.status(500).json({ message: error.message });
    }

}


// Controller Function to Get A Single User Project
export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {projectId} = req.params;

       const project = await prisma.websiteProject.findUnique({
        where: {id: projectId, userId},
        include: {
            conversation: {
                orderBy: {timestamp: 'asc'}
            },
            versions: {orderBy: {timestamp: 'asc'}}
        }
       })

       return res.json({project})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}


// Controller Function to Get All Users Projects
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

       const projects = await prisma.websiteProject.findMany({
        where: {userId},
        orderBy: {updatedAt: 'desc'}
       })

        return res.json({projects})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}



// Controller Function to Toggle Project Publish
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {projectId} = req.params;

        const project = await prisma.websiteProject.findUnique({
           where : {id : projectId , userId}
        })

        if(!project){
            return res.status(404).json({ message: 'Project not found' });
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {isPublished: !project.isPublished}
        })
       
       return res.json({message: project.isPublished ? 'Project Unpublished' : 'Project Published Successfully'})

    } catch (error : any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}


// Controller Function to Purchase Credits
export const purchaseCredits = async (req: Request, res: Response) => {
   try {
     interface Plan {
         credits: number;
         amount: number;
     }
 
     const plans = {
         basic: { credits: 100, amount: 5 },
         pro: { credits: 400, amount: 19 },
         enterprise: { credits: 1000, amount: 49 },
     }
 
 
     const userId = req.userId;
     const { planId } = req.body as { planId: keyof typeof plans }
     const origin = req.headers.origin as string;
 
     const plan: Plan = plans[planId]
 
     if (!plan) {
         return res.status(404).json({ message: 'Plan not found' });
     }
 
     const transaction = await prisma.transaction.create({
         data: {
             userId: userId!,
             planId: req.body.planId,
             amount: plan.amount,
             credits: plan.credits
         }
     })
 
     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
 
     const session = await stripe.checkout.sessions.create({
         success_url: `${origin}/loading`,
         cancel_url: `${origin}`,
         line_items: [
             {
                 price_data: {
                     currency: 'usd',
                     product_data: {
                         name: `AiSiteBuilder - ${plan.credits} credits`
                     },
                     unit_amount: Math.floor(transaction.amount) * 100
                 },
                 quantity: 1
             },
         ],
         mode: 'payment',
         metadata: {
             transactionId: transaction.id,
             appId: 'ai-site-builder'
         },
         expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
     });
 
     return res.json({ payment_link: session.url })
   } catch (error : any) {
     console.log(error.code || error.message);
       return res.status(500).json({ message: error.message });
   }



}
