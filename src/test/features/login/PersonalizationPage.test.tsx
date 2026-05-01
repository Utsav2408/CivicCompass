import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type * as FirebaseAppCheck from "firebase/app-check";
import { type User } from "firebase/auth";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PersonalizationPage } from "@features/login/PersonalizationPage";
import { PersonalizationStep } from "@features/login/login.types";
import { useAuth } from "@features/login/useAuth";
import { usePersonalization } from "@features/login/usePersonalization";
import { usePhoneOtp } from "@features/login/usePhoneOtp";

// Mock hooks
vi.mock("@features/login/useAuth");
vi.mock("@features/login/usePersonalization");
vi.mock("@features/login/usePhoneOtp");
vi.mock("firebase/app-check", async () => {
  const actual =
    await vi.importActual<typeof FirebaseAppCheck>("firebase/app-check");
  return {
    ...actual,
    getToken: vi.fn().mockResolvedValue({ token: "test-app-check-token" }),
  };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
      <div
        data-testid="redirect"
        data-to={to}
        data-replace={String(Boolean(replace))}
      />
    ),
  };
});

describe("PersonalizationPage component", () => {
  const mockUser = { uid: "test-uid-123" } as User;
  const mockUpdateFormData = vi.fn();
  const mockGoNext = vi.fn();
  const mockGoBack = vi.fn();
  const mockSubmit = vi.fn();
  const mockSendOtp = vi.fn();
  const mockVerifyOtp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
      error: null,
    });
    vi.mocked(usePersonalization).mockReturnValue({
      step: PersonalizationStep.Identity,
      setStep: vi.fn(),
      formData: {},
      updateFormData: mockUpdateFormData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      submit: mockSubmit,
      isSubmitting: false,
      errors: {},
    });
    vi.mocked(usePhoneOtp).mockReturnValue({
      sendOtp: mockSendOtp,
      verifyOtp: mockVerifyOtp,
      isLoading: false,
      error: null,
      isOtpSent: false,
      setupRecaptcha: vi.fn(),
    });
  });

  it("renders Identity step initially", () => {
    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("personalization.step_identity")).toBeDefined();
    expect(
      screen.getByPlaceholderText("personalization.identity.name_placeholder"),
    ).toBeDefined();
  });

  it("calls updateFormData when name changes", () => {
    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const input = screen.getByPlaceholderText(
      "personalization.identity.name_placeholder",
    );
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(mockUpdateFormData).toHaveBeenCalledWith({ name: "John Doe" });
  });

  it("triggers voter ID lookup on blur", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          constituency: "Test Constituency",
          pollingBooth: { name: "Booth 1" },
        }),
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const input = screen.getByPlaceholderText(
      "personalization.identity.voter_id_hint",
    );
    fireEvent.blur(input, { target: { value: "ABC1234567" } });

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          voterIdNumber: "ABC1234567",
          constituency: "Test Constituency",
        }),
      );
    });
  });

  it("shows error if voter ID lookup fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const input = screen.getByPlaceholderText(
      "personalization.identity.voter_id_hint",
    );
    fireEvent.blur(input, { target: { value: "ABC1234567" } });

    await waitFor(() => {
      expect(
        screen.getByText("personalization.identity.voter_id_error"),
      ).toBeDefined();
    });
  });

  it("calls sendOtp when button clicked", () => {
    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const phoneInput = screen.getByPlaceholderText(
      "personalization.identity.phone_placeholder",
    );
    fireEvent.change(phoneInput, { target: { value: "+911234567890" } });

    // We have to mock getElementById for the phone input retrieval in the onClick handler
    document.getElementById = vi.fn().mockReturnValue(phoneInput);

    const sendBtn = screen.getByText("personalization.identity.send_otp");
    fireEvent.click(sendBtn);
    expect(mockSendOtp).toHaveBeenCalledWith(
      "+911234567890",
      "recaptcha-container",
    );
  });

  it("renders OTP input when isOtpSent is true", () => {
    vi.mocked(usePhoneOtp).mockReturnValue({
      sendOtp: mockSendOtp,
      verifyOtp: mockVerifyOtp,
      isLoading: false,
      error: null,
      isOtpSent: true,
      setupRecaptcha: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("personalization.identity.otp_label"),
    ).toBeDefined();
    expect(
      screen.getByText("personalization.identity.verify_otp"),
    ).toBeDefined();
  });

  it("renders Preferences step correctly", () => {
    vi.mocked(usePersonalization).mockReturnValue({
      step: PersonalizationStep.Preferences,
      setStep: vi.fn(),
      formData: { electionInterest: ["lok_sabha"] },
      updateFormData: mockUpdateFormData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      submit: mockSubmit,
      isSubmitting: false,
      errors: {},
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("personalization.step_preferences")).toBeDefined();
    expect(
      screen.getByLabelText("personalization.preferences.lok_sabha"),
    ).toBeChecked();
  });

  it("renders Confirm summary correctly", () => {
    vi.mocked(usePersonalization).mockReturnValue({
      step: PersonalizationStep.Confirm,
      setStep: vi.fn(),
      formData: {
        name: "John Doe",
        voterIdNumber: "ABC1234567",
        constituency: "Mumbai North",
        pollingBooth: {
          id: "booth-1",
          name: "School Hall",
          address: "Main St",
          coordinates: { lat: 0, lng: 0 },
          wardName: "Ward 1",
          wardCode: "W01",
          constituency: "Mumbai North",
          city: "Mumbai",
          boothNumber: "12",
        },
      },
      updateFormData: mockUpdateFormData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      submit: mockSubmit,
      isSubmitting: false,
      errors: {},
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Mumbai North")).toBeDefined();
    expect(screen.getByText("School Hall")).toBeDefined();
    expect(screen.getByText("personalization.confirm.finish")).toBeDefined();
  });

  it("calls handleSkip when skip link clicked", async () => {
    mockSubmit.mockResolvedValue(true);
    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const skipBtn = screen.getByText("personalization.skip");
    fireEvent.click(skipBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
    });
  });

  it("redirects to home after successful finish", async () => {
    mockSubmit.mockResolvedValue(true);
    vi.mocked(usePersonalization).mockReturnValue({
      step: PersonalizationStep.Confirm,
      setStep: vi.fn(),
      formData: { name: "John Doe" },
      updateFormData: mockUpdateFormData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      submit: mockSubmit,
      isSubmitting: false,
      errors: {},
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );
    const finishBtn = screen.getByText("personalization.confirm.finish");
    fireEvent.click(finishBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
    });
  });

  it("renders loader while auth is still loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByText("Loading CivicCompass…")).toBeDefined();
    expect(screen.queryByTestId("redirect")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login after auth resolves", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PersonalizationPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("redirect")).toHaveAttribute("data-to", "/login");
    expect(screen.getByTestId("redirect")).toHaveAttribute(
      "data-replace",
      "true",
    );
  });
});
