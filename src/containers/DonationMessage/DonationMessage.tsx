import { Box } from '@/components/ui'

export const DonationMessage = () => (
  <Box className="mb-8">
    <p className="text-sm">
      <strong className="text-slate-100">Help support this project!</strong>{' '}
      Packstack is now open source software. Your contribution helps pay for
      server expenses and keeps this project ad-free. Donate on{' '}
      <a
        href="https://www.patreon.com/packstack"
        target="_blank"
        className="link"
        rel="noreferrer"
      >
        Patreon
      </a>{' '}
      or{' '}
      <a
        href="https://github.com/Packstack-Tech/app"
        target="_blank"
        className="link"
        rel="noreferrer"
      >
        Github
      </a>
      .
    </p>
  </Box>
)
