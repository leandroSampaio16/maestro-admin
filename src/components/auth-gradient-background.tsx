export function AuthGradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      <div
        className="absolute bottom-[-200px] left-[-150px] h-[500px] w-[500px] rounded-full bg-primary opacity-15"
        style={{ filter: "blur(200px)" }}
      />
      <div
        className="absolute right-[-100px] bottom-[-150px] h-[400px] w-[400px] rounded-full bg-primary opacity-15"
        style={{ filter: "blur(150px)" }}
      />
      <div
        className="absolute bottom-[-250px] left-[50%] h-[600px] w-[600px] translate-x-[-50%] rounded-full bg-primary opacity-60"
        style={{ filter: "blur(180px)" }}
      />
      <div
        className="absolute right-[20%] bottom-[-300px] h-[350px] w-[350px] rounded-full bg-primary opacity-60"
        style={{ filter: "blur(120px)" }}
      />
    </div>
  );
}
