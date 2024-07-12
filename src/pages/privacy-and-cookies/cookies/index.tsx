import Link from "next/link";
import Layout from "@/components/Layout";

export default function Home() {
    return (
        <Layout 
            title="Cookies Policy | Seraphic Advisors - Cookie Usage & Management"
            description="Learn about Seraphic Advisors' Cookies Policy, including how we use cookies to improve your experience on our website. Understand your options for managing cookie settings and preferences."
            keywords="Cookies policy, Seraphic Advisors cookies, cookie usage, website cookies, cookie management, user preferences, cookie settings, data tracking"
        >
            <div className="about bg-light">
            <h1>Cookies Policy</h1>
                <section className='about-add'>
                    <div>
                        <h3 className='fw-bold'> <span className='fw-bolder'>| </span> Introduction</h3>
                        <p className='text-grey my-3 me-3'>
                            Seraphic Advisors may use cookies and other tracking technologies when you visit our website, including any other media form to help customize the Site and improve your experience.
                            We reserve the right to make any changes to this cookies policy from time to time. We are under no legal/contractual obligation to inform you of any changes in this cookies policy. As soon as this cookies policy is updated, modified or amended, the “Last Updated” of this cookies policy shall be accordingly revised. The user is hereby advised to regularly visit this cookies policy to stay informed of any update(s). 
                        </p>
                    </div>
                    <div className='py-3 me-3'>
                        <h3>Use of Cookies</h3>
                        <p className='text-grey my-3'>
                            A cookie is a string of information that assigns you a unique identifier that we store on your computer. 
                            We use cookies on our website to provide you with a good experience when you browse our website and also allows us to improve our site. 
                            Among other things, cookies help us keep track of services you have used, the time you spent on each page, record your preferences or registration details, to keep you logged in on the website. 
                            Cookies help us understand how you are using our website and therefore, we can customize your experience. 
                        </p>
                    </div>
                    <div className='py-3 me-3'>
                        <h3>Control of Cookies</h3>
                        <p className="text-grey my-3">
                            Most of the browsers accept cookies by default. 
                            Cookies can be manually removed from your device at any time using the tools or settings in your browser. 
                            However, rejecting/removing the cookies will have an impact on the features and functionalities that you can use over our website. 
                        </p>
                    </div>
                    <div className="py-3 me-3">
                        <h3>Privacy Policy</h3>
                        <p className="text-grey my-3">
                            For more information about how we collect and use your information, please refer to the “Privacy Policy” posted on our Site. This cookies policy shall be a part of Privacy Policy. 
                            {/* "<Link href={"/privacy-and-cookies/privacy"} className="text-reset">Privacy Policy</Link>" */}
                        </p>
                        <p className="fw-bold">NOTE: BY USING THE SITE, YOU AGREE TO BE BOUND BY THIS 
                            <Link href={"/privacy-and-cookies/cookies"} className="p-1">COOKIES POLICY</Link> 
                            AND 
                            <Link href={"/privacy-and-cookies/privacy"} className="p-1">PRIVACY POLICY</Link>
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
  }
