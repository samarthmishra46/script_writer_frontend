import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, CreditCard, Scale, Globe } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'February 10, 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="text-xl font-bold text-white">
            ScriptWriter
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {lastUpdated}</p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Agreement */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using ScriptWriter ("the Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Service. These Terms apply to 
              all visitors, users, and others who access or use the Service.
            </p>
          </section>

          {/* Description of Service */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            </div>
            <p className="text-gray-300 mb-4">
              ScriptWriter is an AI-powered platform that provides:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Ad script generation for various formats (video, image, UGC)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>AI-generated image creatives for advertising</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Competitor analysis and market research tools</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Brand and product management features</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Storyboard and video generation capabilities</span>
              </li>
            </ul>
          </section>

          {/* Account Terms */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">3. Account Terms</h2>
            <div className="space-y-4 text-gray-300">
              <p>When you create an account with us, you must:</p>
              <ul className="space-y-2 ml-4">
                <li>• Provide accurate, complete, and current information</li>
                <li>• Maintain the security of your password and account</li>
                <li>• Accept responsibility for all activities under your account</li>
                <li>• Be at least 18 years of age</li>
                <li>• Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-4">
                We reserve the right to refuse service, terminate accounts, or remove content at our 
                sole discretion.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">4. Acceptable Use</h2>
            </div>
            <p className="text-gray-300 mb-4">You agree to use the Service only for lawful purposes:</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                <h3 className="font-medium text-green-400 mb-2">✓ Allowed</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Creating ads for legitimate products/services</li>
                  <li>• Generating marketing content for your business</li>
                  <li>• Competitor research for business purposes</li>
                  <li>• Storing brand assets and product information</li>
                </ul>
              </div>
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/30">
                <h3 className="font-medium text-red-400 mb-2">✗ Prohibited</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Generating illegal or harmful content</li>
                  <li>• Creating misleading or fraudulent ads</li>
                  <li>• Infringing on others' intellectual property</li>
                  <li>• Reselling or redistributing the service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Content */}
          <section className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-6 border border-red-700/50">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">5. Prohibited Content</h2>
            </div>
            <p className="text-gray-300 mb-4">
              You may NOT use our Service to create content that:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Is illegal, harmful, threatening, abusive, or harassing</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Promotes violence, discrimination, or hate speech</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Contains sexually explicit or pornographic material</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Infringes on copyrights, trademarks, or other intellectual property</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Makes false health claims or promotes dangerous products</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Deceives or misleads consumers about products/services</span>
              </li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">6. Payment & Subscription</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">Billing</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Subscription fees are billed in advance on a monthly or annual basis</li>
                  <li>• All payments are processed securely through Razorpay</li>
                  <li>• Prices are subject to change with 30 days notice</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Credits System</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Credits are consumed when generating content</li>
                  <li>• Unused credits may expire based on your plan terms</li>
                  <li>• Credits are non-transferable and non-refundable</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Refunds</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Refund requests must be made within 7 days of purchase</li>
                  <li>• Refunds are not available for used credits or generated content</li>
                  <li>• We reserve the right to deny refunds in cases of abuse</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">Your Content</h3>
                <p>
                  You retain ownership of all content you create using our Service, including scripts, 
                  images, and other materials. You grant us a limited license to store and process 
                  your content solely to provide the Service.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Our Service</h3>
                <p>
                  The Service, including its original content, features, and functionality, is owned 
                  by ScriptWriter and protected by international copyright, trademark, and other 
                  intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">AI-Generated Content</h3>
                <p>
                  Content generated using our AI tools is provided for your commercial use. You are 
                  responsible for ensuring your use of generated content complies with applicable 
                  laws and third-party rights.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 border border-yellow-700/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">8. Disclaimers</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-yellow-400">THE SERVICE IS PROVIDED "AS IS"</strong> without 
                warranties of any kind, either express or implied, including but not limited to 
                implied warranties of merchantability, fitness for a particular purpose, or 
                non-infringement.
              </p>
              <p>We do not warrant that:</p>
              <ul className="space-y-1 ml-4">
                <li>• The Service will be uninterrupted, secure, or error-free</li>
                <li>• Results obtained will be accurate or reliable</li>
                <li>• AI-generated content will be suitable for your specific needs</li>
                <li>• Any errors in the Service will be corrected</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">9. Limitation of Liability</h2>
            </div>
            <p className="text-gray-300">
              To the maximum extent permitted by law, ScriptWriter shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to 
              loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="space-y-2 mt-4 text-gray-300 ml-4">
              <li>• Your access to or use of (or inability to use) the Service</li>
              <li>• Any conduct or content of any third party on the Service</li>
              <li>• Unauthorized access, use, or alteration of your content</li>
              <li>• Any performance of AI-generated content in your marketing campaigns</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We may terminate or suspend your account immediately, without prior notice or 
                liability, for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you 
                wish to terminate your account, you may do so by discontinuing use of the Service 
                or contacting us.
              </p>
              <p>
                All provisions which by their nature should survive termination shall survive, 
                including ownership provisions, warranty disclaimers, indemnity, and limitations 
                of liability.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days' notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion. 
              By continuing to access or use our Service after revisions become effective, you 
              agree to be bound by the revised terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p className="text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of India, 
              without regard to its conflict of law provisions. Any disputes arising from these 
              Terms or the Service shall be subject to the exclusive jurisdiction of the courts 
              located in India.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> legal@scriptwriter.com</p>
              <p><strong>Support:</strong> support@scriptwriter.com</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-700/50 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600">•</span>
          <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
            Contact Us
          </Link>
          <span className="text-gray-600">•</span>
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
