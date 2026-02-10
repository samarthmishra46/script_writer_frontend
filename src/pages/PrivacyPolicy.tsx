import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Server, Mail, Bell } from 'lucide-react';

const PrivacyPolicy = () => {
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
            Lipiads
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {lastUpdated}</p>
        </div>

        {/* Privacy Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Lipiads ("we," "our," or "us"). We are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our platform for 
              generating ad scripts, images, and related marketing content.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Name and email address</li>
                  <li>Password (encrypted)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Brand & Product Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Brand names and descriptions</li>
                  <li>Product information and images you upload</li>
                  <li>Marketing content and scripts generated</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Features and tools you use</li>
                  <li>Time spent on the platform</li>
                  <li>Device and browser information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>To provide and maintain our services, including generating scripts, images, and ad content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>To process your transactions and manage your subscription</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>To improve and personalize your experience on our platform</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>To communicate with you about updates, features, and support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>To ensure security and prevent fraud</span>
              </li>
            </ul>
          </section>

          {/* Data Protection */}
          <section className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Data Protection & Security</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="font-medium text-green-400">
                🔒 We do NOT sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span>All data is encrypted in transit (HTTPS/TLS) and at rest</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span>We use industry-standard security measures to protect your information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span>Access to personal data is restricted to authorized personnel only</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span>Regular security audits and vulnerability assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span>Your brand and product data remains confidential and is never shared</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Third Party Services */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              We use the following third-party services to operate our platform:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Payment Processing</h3>
                <p className="text-gray-400 text-sm">Razorpay for secure payment processing. We do not store your payment card details.</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Authentication</h3>
                <p className="text-gray-400 text-sm">Google OAuth for secure sign-in. We only receive basic profile information.</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">AI Services</h3>
                <p className="text-gray-400 text-sm">OpenAI for content generation. Your data is not used to train their models.</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Cloud Storage</h3>
                <p className="text-gray-400 text-sm">Google Cloud for secure file storage with enterprise-grade security.</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400">•</span>
                <span><strong>Access</strong> - Request a copy of your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">•</span>
                <span><strong>Rectification</strong> - Request correction of inaccurate data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">•</span>
                <span><strong>Deletion</strong> - Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">•</span>
                <span><strong>Portability</strong> - Request your data in a portable format</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">•</span>
                <span><strong>Withdraw Consent</strong> - Opt out of marketing communications</span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Cookies & Tracking</h2>
            </div>
            <p className="text-gray-300 mb-4">
              We use essential cookies to provide our services and analytics cookies to improve your experience:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Analytics:</strong> Help us understand how you use our platform</li>
              <li><strong>Marketing:</strong> Meta Pixel for measuring ad effectiveness (can be disabled)</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300">
              We retain your personal information for as long as your account is active or as needed to provide 
              services. Upon account deletion, we will delete or anonymize your data within 30 days, except 
              where retention is required by law or for legitimate business purposes (such as resolving disputes).
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-300">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If we become aware that we have collected data from a child, 
              we will take steps to delete such information promptly.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Contact Us</h2>
            </div>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> support@yuvichaarfunnenls.com</p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-700/50 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
            Terms of Service
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

export default PrivacyPolicy;
