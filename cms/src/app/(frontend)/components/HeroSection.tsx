import { Button, Container, Text, Title } from '@mantine/core';
import classes from './HeroSection.module.css';
import Link from 'next/link';

interface HeroSectionProps {
  headline: string;
  subtext: string;
  backgroundImage: {
    url: string;
  };
  primaryColor: string;
}

export function HeroSection({ headline, subtext, backgroundImage, primaryColor }: HeroSectionProps) {
  return (
    <div className={classes.root} style={{ backgroundImage: `url(${backgroundImage.url})` }}>
      <div className={classes.overlay} />
      <Container className={classes.inner} size="lg">
        <div className={classes.content}>
          <Title className={classes.title} style={{ fontFamily: 'var(--font-serif)' }}>
            <span dangerouslySetInnerHTML={{ __html: headline.replace(/<highlight>/g, `<span class="${classes.highlight}" style="color: ${primaryColor}">`).replace(/<\/highlight>/g, '</span>') }} />
          </Title>

          {subtext && (
            <Text className={classes.description} mt={30} style={{ fontFamily: 'var(--font-editorial)' }}>
              {subtext}
            </Text>
          )}

          <div className={classes.controls} >
            <Button
              component={Link}
              href="/properties"
              className={classes.control}
              size="lg"
              variant="filled"
              color="white"
            >
              View Collection
            </Button>
            <Button
              component={Link}
              href="/admin"
              className={classes.control}
              size="lg"
              variant="outline"
              color="white"
            >
              Member Access
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
