export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl p-8 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Registration Received</h1>
        <p className="mb-4">
          Thank you for registering. An administrator will review your account
          and approve access to the Dashboard. You will receive an email when
          your account is approved.
        </p>
        <p className="text-sm text-gray-500">
          If you have questions, contact the HR administrator.
        </p>
      </div>
    </div>
  );
}
