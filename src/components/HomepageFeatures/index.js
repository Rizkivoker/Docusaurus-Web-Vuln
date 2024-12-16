import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: (
      <Translate>
        Easy to Use
      </Translate>
    ),
    description: (
      <Translate>
        Web Vulnerabilities Cheat Sheet was created from the number of list Web Penetration Testing has been done and put into a simple web page.
      </Translate>
    ),
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
  },
  {
    title: (
      <Translate>
        Focus on What Matters
      </Translate>
    ),
    description: (
      <Translate>
        This Cheat Sheet allows you to find easily the specified information of web vulnerabilities for users to use.
      </Translate>
    ),
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
  },
  {
    title: (
      <Translate>
        Powered by React
      </Translate>
    ),
    description: (
      <Translate>
        Helium Cheat Sheet was created by React and Docusaurus.
      </Translate>
    ),
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
